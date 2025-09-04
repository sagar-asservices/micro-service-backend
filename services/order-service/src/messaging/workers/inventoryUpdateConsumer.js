import { createConsumer } from "../consumer.js";
import orderModel from "../../models/order.model.js";
import pino from "pino";
const logger = pino({ name: "order-worker" });

async function handleInventoryEvent(payload, msg) {
  const rk = msg.fields.routingKey; // e.g. order.inventory_reserved
  const { orderId } = payload;

  if (!orderId) {
    logger.warn("no orderId");
    return;
  }

  if (rk === "order.inventory_reserved") {
    await orderModel.findByIdAndUpdate({ _id: orderId }, { status: "Confirmed" });
    logger.info({ orderId }, "Order marked Confirmed");
  } else if (rk === "order.inventory_failed") {
    await orderModel.findByIdAndUpdate({ _id: orderId }, { status: "Failed" });
    logger.info({ orderId }, "Order marked Failed due to inventory");
    // Optionally handle refund/notification here or emit compensation events
  }
}

export async function initInventoryUpdateConsumer() {
  await createConsumer({
    queueName: `${process.env.SERVICE_NAME || "order-service"}.inventoryUpdates`,
    routingKeys: ["order.inventory_reserved", "order.inventory_failed"],
    onMessage: handleInventoryEvent,
    options: { durable: true, maxRetries: 5, deadLetterExchange: `${process.env.RABBITMQ_EXCHANGE}.dlx` }
  });
}
