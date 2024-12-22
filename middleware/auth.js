const serviceAuth = require("../service/auth");

let ServiceAuth = new serviceAuth();

class CheckForAuthentication {
  async checkForAuthentication(req, res, next) {
    const tokenCookieValue = req.cookies["token"];

    if (!tokenCookieValue) {
      return next();
    }

    try {
      const user = ServiceAuth.validateToken(tokenCookieValue);
      req.user = user;
    } catch {}
    return next();
  }
}

module.exports = CheckForAuthentication
