import jwt from "jsonwebtoken";
dotenv.config();
import dotenv from "dotenv"
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1h";

export const generateToken = async (data) => {
  console.log(JWT_SECRET, "<><><><><><><>")
  const token = jwt.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  return token;
};
