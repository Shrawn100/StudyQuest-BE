/* ------- Set up JWT middleware ------- */
const jwt = require("jsonwebtoken");

verifyAndDecodeToken = function (req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];

  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split header
    const bearer = bearerHeader.split(" ");

    // Get token from array
    const bearerToken = bearer[1];

    // Set the token
    req.token = bearerToken;

    // Verify the token
    jwt.verify(req.token, process.env.SECRET, (err, authData) => {
      if (err) {
        console.error("JWT Verification Error:", err);
        res.sendStatus(403);
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    console.log("not allowed");
    // Forbidden
    res.sendStatus(403);
  }
};
module.exports = verifyAndDecodeToken;
