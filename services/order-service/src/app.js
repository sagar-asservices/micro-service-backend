dotenv.config();
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import orderRoutes from "./routes/order.routes.js";
import connectDB from "./common/db.js";
import common from "./common/common.js";
import { connect } from "./messaging/rabbit.js";
import { initInventoryUpdateConsumer } from "./messaging/workers/inventoryUpdateConsumer.js";

const PORT = process.env.PORT || 5003;
global.__ = common;

const app = express();

// security middleware
app.use(helmet());

// allow cors origin
app.use(cors({ origin: "*" }));

// request parsers
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "text/html" }));

// logs
app.use(morgan("dev"));

// compression
app.use(
  compression({
    level: 6,
    threshold: 1024
  })
);

// Static Files
app.use(
  express.static("public", {
    maxAge: "365d",
    etag: true,
    lastModified: true
  })
);

// database
connectDB();

// Routes
app.use("/api/v1", orderRoutes);

async function start() {
  await connect(); // connect to rabbit
  if (process.env.SERVICE_NAME === "order-service") {
    await initInventoryUpdateConsumer();
  }
}
start();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, (err) => {
  if (err) {
    console.log("❌ Error while start server");
    return;
  }
  console.log(`✅ Server running on : http://localhost:${PORT}`);
});
