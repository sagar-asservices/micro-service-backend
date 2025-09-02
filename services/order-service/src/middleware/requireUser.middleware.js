
const requireUser = async (req, res, next) => {
  try {
    const userId = req.headers["user_id"];
  if (!userId) return res.status(401).json({ message: "Authentication required" });
  req.userId = userId;
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

export default requireUser;