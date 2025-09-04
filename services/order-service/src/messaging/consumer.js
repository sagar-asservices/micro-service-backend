// src/messaging/consumer.js
import { createChannel, EXCHANGE } from './rabbit.js';
import pino from 'pino';
const logger = pino({ name: process.env.SERVICE_NAME || 'order-service' });

/**
 * createConsumer:
 *  - queueName: string (optional; recommended include service name)
 *  - routingKeys: array of routing keys or patterns (e.g. ['order.created'])
 *  - onMessage: async function(msgBody, message) -> should ack or reject
 *  - options: { durable:true, prefetch: Number, deadLetterExchange }
 */
async function createConsumer({ queueName, routingKeys = [], onMessage, options = {} }) {
  const ch = await createChannel(queueName || 'worker');
  const prefetch = parseInt(process.env.RABBITMQ_PREFETCH || '5', 10);
  await ch.prefetch(options.prefetch || prefetch);
  const q = queueName || `${process.env.SERVICE_NAME || 'order-service'}.${Math.random().toString(36).slice(2,8)}`;

  const queueOptions = { durable: !!options.durable, arguments: {} };
  if (options.deadLetterExchange) {
    queueOptions.arguments['x-dead-letter-exchange'] = options.deadLetterExchange;
  }
  await ch.assertQueue(q, queueOptions);

  // bind to exchange for each routing key
  for (const rk of routingKeys) {
    await ch.bindQueue(q, EXCHANGE, rk);
    logger.info({ queue: q, rk }, 'bound');
  }

  await ch.consume(q, async (msg) => {
    if (!msg) return;
    let content = null;
    try {
      const str = msg.content.toString();
      content = JSON.parse(str);
    } catch (err) {
      logger.error({ err }, 'Failed to parse message; rejecting');
      // malformed message -> reject and don't requeue
      ch.reject(msg, false);
      return;
    }

    try {
      // user-provided handler
      await onMessage(content, msg);
      ch.ack(msg);
    } catch (err) {
      logger.error({ err }, 'Handler failed - deciding to retry or dead-letter');
      // example: move to DLX by rejecting without requeue (if retries exhausted)
      const headers = msg.properties.headers || {};
      const retries = (headers['x-retries'] || 0) + 1;
      if (retries > (options.maxRetries || 3)) {
        // reject and don't requeue -> DLX (if configured)
        ch.reject(msg, false);
      } else {
        // simple requeue strategy: publish to same exchange with header increment and ack original
        const newHeaders = { ...headers, 'x-retries': retries };
        ch.publish(EXCHANGE, msg.fields.routingKey, msg.content, { headers: newHeaders, persistent: true });
        ch.ack(msg);
      }
    }
  }, { noAck: false });

  logger.info({ queue: q, routingKeys }, 'consumer created');
  return { queue: q };
}

export { createConsumer };
