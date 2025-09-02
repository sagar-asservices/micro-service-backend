import { http_codes, messages } from "../constant/text.constant.js";
import productModel from "../models/product.model.js";
import mongoose from "mongoose";

const createProduct = async (req, res) => {
  try {
    const { sku, name, description, price, stock } = req.body;
    // validation
    const required = ["sku", "name", "description", "price", "stock"];
    const validate = __._checkFields(req.body, required);
    if (validate !== true) throw new Error(validate.message);

    // condition
    const existSku = await productModel.findOne({ sku: sku }).select("sku");
    if (existSku) {
      return __._error({code: http_codes.badRequest,message: messages.skuAlreadyExist,res});
    }
    // store user and give response
    let productObj = {
      sku,
      name,
      description,
      price: parseInt(price),
      stock: parseInt(stock)
    };
    const product = new productModel(productObj);
    await product.save();

    const response = {
      productId: product._id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
      createdAt: product.createdAt
    };

    return __._success({ code: http_codes.created, message: messages.productCreated, data: response, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: messages.internalError,
      res,
      error: err.message,
      method: "createProduct"
    });
  }
};

const getProductList = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const perPage = limit ? parseInt(limit) : 10;
    const currentPage = page ? parseInt(page) : 1;
    const skip = (currentPage - 1) * perPage;

    let wh = {
      status: "Active"
    };

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
          productId: "$_id",
          sku: 1,
          name: 1,
          description: 1,
          price: 1,
          stock: 1,
          _id: 0
        }
      }
    ];
    const productList = await productModel.aggregate(agg);
    const totalProduct = await productModel.countDocuments(wh);

    let data = {};
    data["list"] = productList;
    data["totalDocument"] = totalProduct;
    data["currentPage"] = currentPage;
    data["totalPage"] = Math.ceil(totalProduct / perPage);

    return __._success({ code: http_codes.ok, message: messages.fetched, data, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: messages.internalError,
      res,
      error: err.message,
      method: "createProduct"
    });
  }
};

const productDetail = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return __._error({code: http_codes.badRequest,message: messages.productIdRequired,res});
    }
    let product = await productModel
      .findOne({ _id: new mongoose.Types.ObjectId(productId) })
      .select("_id sku name description price stock createdAt")
      .lean();

    if (!product) {
      return __._error({code: http_codes.badRequest,message: messages.productNotFound,res});
    }

    product["productId"] = product._id;
    delete product._id;

    return __._success({ code: http_codes.ok, message: messages.fetched, data: product, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: messages.internalError,
      res,
      error: err.message,
      method: "productDetail"
    });
  }
};

export default {
  createProduct,
  getProductList,
  productDetail
};
