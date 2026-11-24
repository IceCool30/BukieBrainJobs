"""
Example 1: Naive AI-Generated Code
Characteristics:
- Optimistic happy-path assumption.
- Bare catch-all exceptions that swallow error context.
- Missing atomic database transactions.
- Lack of idempotency keys (can double charge on retry).
- Raw print statements instead of structured logging.
- Missing explicit timeouts.
"""

import requests

def process_order(user_id, order_id, amount, items):
    # 1. Process payment
    try:
        payment_payload = {"user_id": user_id, "amount": amount}
        # Flaw: No timeout specified! Can hang indefinitely on network stall.
        res = requests.post("https://api.payment.com/v1/charge", json=payment_payload)
        payment_data = res.json()
        
        if payment_data.get("status") != "success":
            return {"success": False, "message": "Payment failed"}
    except Exception as e:
        # Flaw: Swallows the traceback, destroys debugging context.
        print(f"Error processing payment: {e}")
        return {"success": False, "error": str(e)}

    # 2. Update inventory
    try:
        for item in items:
            # Flaw: No transaction boundary! If item #3 fails, items #1 and #2 remain deducted
            # and payment has already been taken without refund!
            db.execute(
                "UPDATE inventory SET stock = stock - %s WHERE item_id = %s",
                (item["qty"], item["id"])
            )
        db.commit()
    except Exception as e:
        print(f"Database error: {e}")
        return {"success": False, "error": "Inventory update failed"}

    return {"success": True, "transaction_id": payment_data.get("id")}
