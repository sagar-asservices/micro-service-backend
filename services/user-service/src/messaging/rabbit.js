// src/messaging/rabbit.js
import amqp from 'amqplib';
import pino from 'pino';

const logger = pino({ name: process.env.SERVICE_NAME || 'user-service' });

let connection = null;
let channels = new Map();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'product.events';
const EXCHANGE_TYPE = process.env.RABBITMQ_EXCHANGE_TYPE || 'topic';

async function connect() {
  if (connection) return connection;
  const maxRetries = 10;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      logger.info({ url: RABBITMQ_URL }, 'Connecting to RabbitMQ');
      connection = await amqp.connect(RABBITMQ_URL);
      connection.on('error', (err) => {
        logger.error({ err }, 'RabbitMQ connection error');
        connection = null;
      });
      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        connection = null;
      });
      // create default channel where we assert exchanges
      const ch = await createChannel('default');
      await ch.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      return connection;
    } catch (err) {
      attempt++;
      logger.error({ attempt, err }, 'Failed to connect rabbitmq - retrying');
      await new Promise(r => setTimeout(r, Math.min(1000 * attempt, 10000)));
    }
  }
  throw new Error('Could not connect to RabbitMQ');
}

async function createChannel(name = 'worker') {
  if (!connection) await connect();
  if (channels.has(name)) return channels.get(name);
  const ch = await connection.createChannel();
  // good defaults
  ch.on('error', (err) => logger.error({ err }, `Channel ${name} error`));
  ch.on('close', () => {
    logger.info(`Channel ${name} closed`);
    channels.delete(name);
  });
  channels.set(name, ch);
  return ch;
}

async function close() {
  for (const ch of channels.values()) {
    try { await ch.close(); } catch (_) {}
  }
  channels.clear();
  if (connection) {
    try { await connection.close(); } catch (_) {}
    connection = null;
  }
}

export { connect, createChannel, EXCHANGE, close };
