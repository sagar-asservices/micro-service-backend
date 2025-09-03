import { http_codes, messages } from "../constant/text.constant.js";

const requireUser = async (req, res, next) => {
  try {
    console.log("userId:::::::::::::", req.headers.user_id);
    const userId = req.headers.user_id;
    if (!userId) return __._error({ code: http_codes.unAuthorized, message: messages.authRequired, res });
    req.userId = userId;
    next();
  } catch (err) {
    return __._error({
      code: 500,
      message: "Internal Server Error",
      res,
      error: err.message,
      method: "AuthToken"
    });
  }
};

export default requireUser;
