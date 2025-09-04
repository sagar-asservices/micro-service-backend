import orderModel from "../models/order.model.js";
import { http_codes, messages } from "../constant/text.constant.js";
import mongoose from "mongoose";
import { publish } from "../messaging/publisher.js";

const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity, price } = req.body;

    const required = ["userId", "productId", "quantity"];
    const validate = __._checkFields(req.body, required);
    if (validate !== true) throw new Error(validate.message);

    // store user and give response
    let orderObj = {
      userId,
      productId,
      quantity,
      price: quantity * price
    };
    let order = new orderModel(orderObj);
    await order.save();

    const response = {
      userId: userId,
      productId: productId,
      quantity: quantity,
      price: order.price,
      status: order.status,
      orderId: order._id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    await publish("order.created", response, { messageId: `order:${response.orderId}` });
    return __._success({ code: http_codes.created, message: messages.orderCreated, data: response, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: err.message || messages.internalError,
      res,
      error: err.message,
      method: "createOrder"
    });
  }
};

const myOrderList = async (req, res) => {
  try {
    const { userId, page, limit } = req.query;

    const perPage = limit ? parseInt(limit) : 10;
    const currentPage = page ? parseInt(page) : 1;
    const skip = (currentPage - 1) * perPage;

    if (!userId) {
      return __._error({ code: http_codes.badRequest, message: messages.userIdRequired, res });
    }
    let wh = { userId: new mongoose.Types.ObjectId(userId) };

    const agg = [
      {
        $match: wh
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: perPage
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          productId: 1,
          quantity: 1,
          orderId: "$_id",
          status: 1,
          createdAt: 1
        }
      }
    ];

    const orderList = await orderModel.aggregate(agg);
    const totalOrder = await orderModel.countDocuments(wh);

    let data = {};
    data["list"] = orderList;
    data["totalDocument"] = totalOrder;
    data["currentPage"] = currentPage;
    data["totalPage"] = Math.ceil(totalOrder / perPage);

    return __._success({ code: http_codes.ok, message: messages.fetched, data, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: err.message || messages.internalError,
      res,
      error: err.message,
      method: "myOrderList"
    });
  }
};

export default {
  createOrder,
  myOrderList
};
