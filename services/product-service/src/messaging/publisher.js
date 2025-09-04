// src/messaging/publisher.js
import { createChannel, EXCHANGE } from './rabbit.js';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
const logger = pino({ name: process.env.SERVICE_NAME || 'product-service' });

async function publish(routingKey, payload, opts = {}) {
  const ch = await createChannel('publisher');
  const msgBuffer = Buffer.from(JSON.stringify(payload));
  const options = {
    persistent: true,          // survive broker restart
    messageId: opts.messageId || uuidv4(),
    timestamp: Date.now(),
    contentType: 'application/json',
    headers: opts.headers || {},
  };
  const ok = ch.publish(EXCHANGE, routingKey, msgBuffer, options);
  if (!ok) {
    // handle backpressure: ch.waitForConfirms() if using confirm channel
    logger.warn({ routingKey }, 'publish returned false (broker busy)');
  } else {
    logger.debug({ routingKey, messageId: options.messageId }, 'published event');
  }
  return options.messageId;
}

export { publish };
