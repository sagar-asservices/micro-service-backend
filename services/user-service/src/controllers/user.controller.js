import userModel from "../models/user.model.js";
import { http_codes, messages } from "../constant/text.constant.js";
import { generateToken } from "../utils/utils.js";
import mongoose from "mongoose";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // validation
    const required = ["name", "email", "password"];
    const validate = __._checkFields(req.body, required);
    if (validate !== true) throw new Error(validate.message);

    //conditions
    const userExist = await userModel.findOne({ email: email }).select("email");
    if (userExist) {
      return __._error({ code: http_codes.badRequest, message: messages.emailAlreadyExist, res });
    }

    // store user, create token and give response
    let userObj = {
      name,
      email,
      password
    };
    const user = new userModel(userObj);
    await user.save();

    const tokenObj = {
      userId: user._id,
      email: email
    };
    const token = await generateToken(tokenObj);
    const response = {
      user: {
        userId: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
    return __._success({ code: http_codes.created, message: messages.userCreated, data: response, res });
  } catch (err) {
    // error catch
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: err.message || messages.internalError,
      res,
      error: err.message,
      method: "register"
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validation
    const required = ["email", "password"];
    const validate = __._checkFields(req.body, required);
    if (validate !== true) throw new Error(validate.message);

    const user = await userModel.findOne({ email });
    if (!user) return __._error({ code: http_codes.badRequest, message: messages.userNotFound, res });

    const ok = await user.comparePassword(password);
    if (!ok) return __._error({ code: http_codes.badRequest, message: messages.invalidPassword, res });

    const tokenObj = {
      userId: user._id,
      email: user.email
    };
    const token = await generateToken(tokenObj);
    const response = {
      user: {
        userId: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
    return __._success({ code: http_codes.created, message: messages.loginSuccess, data: response, res });
  } catch (err) {
    console.log(err);
    // error catch
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: err.message || messages.internalError,
      res,
      error: err.message,
      method: "login"
    });
  }
};

const profile = async (req, res) => {
  try {
    // const userId = req.userId;
    const userId = "68b6d4a5ca3841e3e226b893";
    console.log("Profile_userId::::", userId);
    const user = await userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    const response = {
      userId: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt
    };
    return __._success({ code: http_codes.created, message: messages.fetched, data: response, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: err.message || messages.internalError,
      res,
      error: err.message,
      method: "profile"
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await userModel.findById(new mongoose.Types.ObjectId(req.query.userId));
    let isUserExist = false;
    if (user) {
      isUserExist = true;
    }
    console.log("isUserExist", isUserExist);
    return __._success({ code: http_codes.ok, messages: messages.fetched, data: { isUserExist }, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: err.message || messages.internalError,
      res,
      error: err.message,
      method: "verifyUser"
    });
  }
};

const getUserList = async (req, res) => {
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
          _id: 0,
          userId: "$_id",
          name: 1,
          email: 1,
          status: 1,
          createdAt: 1
        }
      }
    ];
    const usersList = await userModel.aggregate(agg);
    const totalUser = await userModel.countDocuments(wh);

    let data = {};
    data["list"] = usersList;
    data["totalDocument"] = totalUser;
    data["currentPage"] = currentPage;
    data["totalPage"] = Math.ceil(totalUser / perPage);

    return __._success({ code: http_codes.ok, message: messages.fetched, data, res });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: messages.internalError,
      res,
      error: err.message,
      method: "getUserList"
    });
  }
};

export default {
  register,
  login,
  profile,
  getUserList,
  verifyUser
};
