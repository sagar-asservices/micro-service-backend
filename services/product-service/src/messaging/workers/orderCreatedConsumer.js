import { createConsumer } from "../consumer.js";
import { publish } from "../publisher.js";
import productModel from "../../models/product.model.js";
import pino from "pino";
const logger = pino({ name: "product-worker" });

async function handleOrderCreated(payload, msg) {
  // payload: { orderId, items: [ { productId, qty } ] }
  const messageId = msg.properties.messageId;

  // Try to reserve/decrement stock for all items
  const { orderId, productId, quantity } = payload;
  let allOk = true;
  // atomic decrement if enough stock
  const updated = await productModel.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );
  if (!updated) {
    allOk = false;
  }

  if (allOk) {
    await publish("order.inventory_reserved", { orderId }, { messageId: `inventory:${orderId}` });
    logger.info({ orderId }, "inventory reserved");
  } else {
    // If fail, you may choose to roll back any partial decrement (compensation) OR only decrement if all available.
    // For simplicity here, we assume we used atomic check + decrement; if partial decrement occurred we'd need rollback logic.
    await publish("order.inventory_failed", { orderId }, { messageId: `inventory:${orderId}:failed` });
    logger.warn({ orderId }, "inventory failed");
  }
}

export async function initOrderCreatedConsumer() {
  await createConsumer({
    queueName: `${process.env.SERVICE_NAME || "product-service"}.orders`,
    routingKeys: ["order.created"],
    onMessage: handleOrderCreated,
    options: { durable: true, maxRetries: 3, deadLetterExchange: `${process.env.RABBITMQ_EXCHANGE}.dlx` }
  });
}
