import { _success, _error } from "../common/common.js";
import jwt from "jsonwebtoken";
dotenv.config();
import dotenv from "dotenv";
import axios from "axios";
const JWT_SECRET = process.env.JWT_SECRET;

const authUser = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return next(); // allow open endpoints
    const token = auth.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);

      try {
        const response = await axios.get(`http://user_service:5001/api/v1/verifyuser?userId=${payload.userId}`);
        if (response.data.isUserExist === false) return _error({ code: 401, message: "Invalid User", res });
      } catch (err) {
        console.log(err);
        return _error({
          code: 500,
          message: "User-service unavailable",
          res,
          error: err.message,
          method: "authUser-verifyUser"
        });
      }

      // attach minimal identity info as headers so services can use them
      req.headers["user_id"] = payload.userId;
      req.headers["user_email"] = payload.email;
    } catch (e) {
      // token invalid → reject here OR let it pass and let services decide
      return _error({ code: 401, message: "Invalid token", res });
    }
    next();
  } catch (err) {
    console.log(err);
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
