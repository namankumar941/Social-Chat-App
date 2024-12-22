const jwt = require("jsonwebtoken");
const secret = "nksingh@123";

class serviceAuth {
  createToken(user) {
    return jwt.sign(
      {
        email: user.email,
      },
      secret
    );
  }

  validateToken(token) {
    if (!token) return null;
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      return null;
    }
  }
}

module.exports = serviceAuth;
