var express = require("express");
var router = express.Router();

//Require JWT middleware
const verifyAndDecodeToken = require("./JWToken");
//Require controller modules.
const user_controller = require("../controllers/User_controller");

//// Authentication Routes ////

//Check if user already signed in on page load

router.get("/checkUser", verifyAndDecodeToken, user_controller.checkUser);

//Post request to sign up an account
router.post("/signup", user_controller.signup);

//Post request to login
router.post("/login", user_controller.login);

//Post request to sign in with google
router.post("/googleSignIn", user_controller.googleSignIn);

//Get request to see study history
router.get("/history", verifyAndDecodeToken, user_controller.history);

//Post Study Session

router.post("/session", verifyAndDecodeToken, user_controller.studySession);
module.exports = router;
