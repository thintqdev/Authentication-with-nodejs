const jwt = require("jsonwebtoken");
function isJwtExpired(req, res) {
  try {
    const headers = req.headers.authorization;
    console.log(headers)
    if (headers) {
      const token = headers.split(" ")[1];
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      var dateNow = new Date();
      if (decode.exp > dateNow.getTime() / 1000) {
        return true;
      }
    }
  } catch (error) {
    return false;
  }
}
module.exports = isJwtExpired;
