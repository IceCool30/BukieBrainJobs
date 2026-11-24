"""
Example 2: Senior Human Production Engineering Code
Characteristics:
- Atomic database transactions with rollback guarantee.
- Concurrency-safe atomic reservations (WHERE stock >= qty).
- Idempotency tokens on external write calls.
- Custom typed domain errors.
- Structured contextual logging with correlation metadata.
- Configured timeouts and retries with backoff.
"""

import logging
from dataclasses import dataclass
from typing import List, Protocol
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger("payments.order_processor")

@dataclass(frozen=True)
class OrderItem:
    item_id: str
    quantity: int

class PaymentGatewayTimeout(Exception):
    """Raised when payment provider fails to respond within the timeout."""

class InsufficientInventoryError(Exception):
    """Raised when one or more items cannot be fulfilled."""

class PaymentClient(Protocol):
    def charge(self, user_id: str, amount: int, idempotency_key: str, timeout_seconds: float):
        ...

class OrderService:
    def __init__(self, payment_client: PaymentClient, db_pool, metrics_client):
        self.payment = payment_client
        self.db_pool = db_pool
        self.metrics = metrics_client

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(PaymentGatewayTimeout),
        reraise=True
    )
    def _execute_charge(self, user_id: str, amount: int, idempotency_key: str):
        # Idempotency token prevents double-billing on network retry
        return self.payment.charge(
            user_id=user_id,
            amount=amount,
            idempotency_key=idempotency_key,
            timeout_seconds=5.0
        )

    def process_order(self, user_id: str, order_id: str, amount: int, items: List[OrderItem]) -> str:
        log_ctx = {"user_id": user_id, "order_id": order_id}
        logger.info("Initiating order checkout", extra=log_ctx)

        # 1. Atomic reservation inside single database transaction
        with self.db_pool.get_connection() as conn:
            with conn.transaction():
                for item in items:
                    rows_updated = conn.execute(
                        """
                        UPDATE inventory 
                        SET stock = stock - %s 
                        WHERE item_id = %s AND stock >= %s
                        """,
                        (item.quantity, item.item_id, item.quantity)
                    )
                    if rows_updated == 0:
                        self.metrics.increment("orders.inventory_depleted", tags=[f"item:{item.item_id}"])
                        raise InsufficientInventoryError(f"Item {item.item_id} is out of stock")

                # 2. Charge payment with guaranteed correlation ID and timeout
                try:
                    charge_result = self._execute_charge(
                        user_id=user_id,
                        amount=amount,
                        idempotency_key=f"order_{order_id}_charge"
                    )
                except Exception as exc:
                    # Transaction automatically rolls back on raised exception
                    logger.error("Payment failed. Rolling back inventory lock", exc_info=True, extra=log_ctx)
                    self.metrics.increment("orders.payment_failed")
                    raise

                # 3. Finalize order state within the same transaction
                conn.execute(
                    "INSERT INTO orders (id, user_id, payment_ref, status) VALUES (%s, %s, %s, 'CONFIRMED')",
                    (order_id, user_id, charge_result.id)
                )

        logger.info("Order processed successfully", extra={**log_ctx, "charge_id": charge_result.id})
        self.metrics.increment("orders.success")
        return charge_result.id
