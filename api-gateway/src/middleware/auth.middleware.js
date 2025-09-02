import { _success, _error } from "../common/common.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

const authUser = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return next(); // allow open endpoints
    const token = auth.split(" ")[1];
    try {
      const payload = jwt.decode(token, JWT_SECRET);
      // attach minimal identity info as headers so services can use them
      req.headers["user_id"] = payload.userId;
      req.headers["user_email"] = payload.email;
    } catch (e) {
      // token invalid → reject here OR let it pass and let services decide
      return _error({ code: 401, message: "Invalid token", res });
    }
    next();
  } catch (err) {
    return _error({
      code: 500,
      message: "Internal Server Error",
      res,
      error: err.message,
      method: "AuthToken"
    });
  }
};

export default authUser;
