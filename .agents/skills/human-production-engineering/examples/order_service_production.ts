/**
 * Example 3: Senior Human Production Engineering in TypeScript / Prisma
 * Characteristics:
 * - Runtime Zod schema validation.
 * - Atomic Prisma interactive transaction ($transaction).
 * - Idempotency key forwarding.
 * - Leveled structured logging.
 * - Explicit typed errors.
 */

import { z } from "zod";

export const OrderItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const ProcessOrderInputSchema = z.object({
  userId: z.string().uuid(),
  orderId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  items: z.array(OrderItemSchema).min(1),
});

export type ProcessOrderInput = z.infer<typeof ProcessOrderInputSchema>;

export class InsufficientInventoryError extends Error {
  constructor(public readonly itemId: string) {
    super(`Item ${itemId} has insufficient inventory.`);
    this.name = "InsufficientInventoryError";
  }
}

export class PaymentGatewayError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

export interface PaymentClient {
  charge(params: {
    userId: string;
    amountCents: number;
    idempotencyKey: string;
    timeoutMs: number;
  }): Promise<{ transactionId: string }>;
}

export class OrderService {
  constructor(
    private readonly db: any, // PrismaClient instance
    private readonly payment: PaymentClient,
    private readonly logger: any,
    private readonly metrics: any
  ) {}

  public async processOrder(rawInput: unknown): Promise<{ transactionId: string }> {
    // 1. Edge validation
    const input = ProcessOrderInputSchema.parse(rawInput);
    const logCtx = { orderId: input.orderId, userId: input.userId };

    this.logger.info("Initiating checkout transaction", logCtx);

    // 2. Interactive atomic transaction
    return await this.db.$transaction(async (tx: any) => {
      for (const item of input.items) {
        // Atomic decrement with condition
        const updated = await tx.inventory.updateMany({
          where: {
            itemId: item.itemId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          this.metrics.increment("orders.inventory_depleted", { itemId: item.itemId });
          throw new InsufficientInventoryError(item.itemId);
        }
      }

      // 3. Mutating payment with idempotency key
      let paymentResult: { transactionId: string };
      try {
        paymentResult = await this.payment.charge({
          userId: input.userId,
          amountCents: input.amountCents,
          idempotencyKey: `order_${input.orderId}_payment`,
          timeoutMs: 5000,
        });
      } catch (err) {
        this.logger.error("Payment failed; rolling back inventory reservation", {
          ...logCtx,
          err,
        });
        this.metrics.increment("orders.payment_failed");
        throw new PaymentGatewayError("Payment charge failed", err);
      }

      // 4. Record order within the same transaction
      await tx.order.create({
        data: {
          id: input.orderId,
          userId: input.userId,
          paymentRef: paymentResult.transactionId,
          status: "CONFIRMED",
        },
      });

      this.logger.info("Order processed successfully", {
        ...logCtx,
        transactionId: paymentResult.transactionId,
      });
      this.metrics.increment("orders.success");

      return { transactionId: paymentResult.transactionId };
    });
  }
}
