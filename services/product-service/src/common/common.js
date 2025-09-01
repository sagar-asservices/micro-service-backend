export default {
  _success: ({ code, message, data, res, extra }) => {
    return res.status(code).json({
      code: code,
      message: message,
      data: data,
      ...extra,
    });
  },

  _error: ({ code, message, res, extra, error, method = null }) => {
    let errResp = {
      code: code,
      error: {
        message: message,
        extra,
      },
    };
    if (process.env.DEBUG === "true") {
      errResp.error.stack = error?.stack;
      errResp.error.method = method;
    }
    return res.status(code).json(errResp);
  },

  _checkFields: function (body, required, skip = []) {
    for (var i = 0; i < required.length; i++) {
      if (Object.keys(body).indexOf(required[i]) === -1) {
        return {
          is_valid: false,
          message: required[i] + " is required.",
        };
      }
    }

    for (var i = 0; i < Object.keys(body).length; i++) {
      var field = Object.keys(body)[i];
      if (body[field] == null) {
        body[field] = "";
      }
      if (
        body[field].toString().trim() == "" &&
        field !== "image" &&
        required.indexOf(field) !== -1
      ) {
        return {
          is_valid: false,
          message: field + " is required.",
        };
      }

      if (
        field == "email" &&
        required.indexOf(field) !== -1 &&
        !this._validateEmail(body[field].toString().trim())
      ) {
        return {
          is_valid: false,
          message: "Please enter valid email address.",
        };
      }
    }

    return true;
  },
  _validateEmail: function (email) {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
};
