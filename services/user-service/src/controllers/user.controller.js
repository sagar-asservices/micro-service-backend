import userModel from "../models/user.model.js";
import { http_codes, messages } from "../constant/text.constant.js";

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // validation
    const required = ["name", "email", "password"];
    const validate = __._checkFields(req.body, required);
    if (validate !== true) throw new Error(validate.message);

    //conditions
    const userExist = await userModel.findOne({ email: email }).select('email');
    if (userExist) {
      return __._error({
        code: http_codes.badRequest,
        message: messages.emailAlreadyExist,
        res,
      });
    }

    // store user and give response
    let userObj = {
      name,
      email,
      password,
    };
    const user = new userModel(userObj);
    await user.save();

    return __._success({
      code: http_codes.created,
      message: messages.created,
      data: user,
      res,
    });
  } catch (err) {
    // error catch
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: err.message || messages.internalError,
      res,
      error: err.message,
      method: "createUser",
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
      status: "Active",
    };

    const agg = [
      {
        $match: wh,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: perPage,
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: 1,
          email: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ];
    const usersList = await userModel.aggregate(agg);
    const totalUser = await userModel.countDocuments(wh);

    let data = {};
    data["list"] = usersList;
    data["totalDocument"] = totalUser;
    data["currentPage"] = currentPage;
    data["totalPage"] = Math.ceil(totalUser / perPage);

    return __._success({
      code: http_codes.ok,
      message: messages.fetched,
      data,
      res,
    });
  } catch (err) {
    console.log(err);
    return __._error({
      code: http_codes.internalError,
      message: messages.internalError,
      res,
      error: err.message,
      method: "getUserList",
    });
  }
};

export default {
  createUser,
  getUserList,
};
