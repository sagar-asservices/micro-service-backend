export const http_codes = {
  badRequest: 400,
  internalError: 500,
  created: 201,
  notFound: 404,
  ok: 200,
  notImplemented: 501,
  forbidden: 403,
  unAuthorized: 401,
};

export const messages = {
  badRequest: "Bad Request",
  internalError: "Internal Server Error",
  notFound: "Not Found",
  forbidden: "Forbidden",
  unAuthorized: "UnAuthorized",
  created: "Data created Successfully",
  updated: "Data updated Successfully",
  deleted: "Data deleted Successfully",
  fetched: "Data fetched Successfully",
  routeNotFound: "Route not Found",
  authorizationHeaderRequired: "Authorization Header Required",
  invalidTokenFormat: "Invalid Token Format",
  tokenCannotBeEmpty: "Token can not be empty",
  emailAlreadyExist: "Email already exist, please try another one.",
  orderCreated: "Order created successfully",
  userIdRequired: "User id required"
};

export const schemas = {
  user: "user",
};
