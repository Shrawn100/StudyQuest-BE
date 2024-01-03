const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const StudySession = require("../models/StudySession");
const jwt = require("jsonwebtoken");
//Handle user signup
exports.signup = [
  body("name", "Display name must be at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("username", "Username must be at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("password", "Password must be at least 6 characters")
    .trim()
    .isLength({ min: 6 })
    .custom((value, { req }) => {
      if (!/(?=.*[A-Z])/.test(value)) {
        throw new Error("Password must contain at least 1 capital letter");
      }
      if (!/(?=.*\d)/.test(value)) {
        throw new Error("Password must contain at least 1 number");
      }
      return value;
    })
    .escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.json({ message: "Validation failed", errors: errorMessages });
    }

    const { username, password, name } = req.body;
    try {
      // Check if user with the same username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.json({
          message: "Username already exists. Please pick another one.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt

      const newUser = new User({
        name,
        username,
        password: hashedPassword, // Store the hashed password in the database
      });

      await newUser.save(); // Save the new user to the database

      jwt.sign(
        { user: newUser }, // You can include additional data if needed
        process.env.SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          if (err) {
            console.error("JWT Signing Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }
          res.json({
            message: "User registered successfully",
            token,
            user: newUser,
          });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  },
];

exports.googleSignIn = [
  body("name").trim().isLength({ min: 1 }).escape(),
  body("email").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.json({ message: "Validation failed", errors: errorMessages });
    }

    const { email, name } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({
        email,
        name,
      });
      await newUser.save();
    }

    const dataToSign = user ? { user } : { newUser };

    jwt.sign(
      dataToSign,
      process.env.SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) {
          console.error("JWT Signing Error:", err);
          return res.status(222).json({ message: "Internal Server Error" });
        }
        res.json({ token, user: user || newUser });
      }
    );
  }),
];

exports.login = [
  body("username", "Invalid username").trim().isLength({ min: 3 }).escape(),
  body("password", "Invalid password").trim().isLength({ min: 6 }).escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ message: "Unsuccessful", errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ message: "Wrong password" });
    }

    jwt.sign(
      { user },
      process.env.SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) {
          console.error("JWT Signing Error:", err);
          return res.status(222).json({ message: "Internal Server Error" });
        }
        res.json({ token, user });
      }
    );
  }),
];

exports.checkUser = (req, res) => {
  const authData = req.authData;
  res.json({ authData });
};

exports.history = asyncHandler(async (req, res) => {
  const userId = req.authData.user._id;

  // Fetch the user with populated history
  const history = await StudySession.find({ user: userId }).exec();
  console.log(history);
  if (!history) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ history });
});

exports.studySession = asyncHandler(async (req, res) => {
  const user = req.authData.user._id;
  // Create a new StudySession instance
  const studySession = new StudySession({
    user,
    duration: req.body.duration,
  });

  // Save the study session to the database
  const savedSession = await studySession.save();

  // Log the user ID before updating
  console.log("Updating user document with ID:", user);

  // Update the User model's history field
  await User.findByIdAndUpdate(
    user,
    { $push: { history: savedSession._id } }, // Assuming history is an array of ObjectIds
    { new: true }
  );
  // Respond with the saved study session
  res.status(201).json(savedSession);
});
