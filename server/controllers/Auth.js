const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// sendOtp
exports.sendOTP = async (req, res) => {
  try {
    // fetch email from request body
    const { email } = req.body;
    // check if user already exists
    const checkUserPresent = await User.findOne({ email });

    // if user already exist then return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("otp generated", otp);

    // check unique otp or not

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    // create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successful
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return (
      res.status(500),
      json({
        success: false,
        message: error.message,
      })
    );
  }
};

// sign up

exports.signUp = async (req, res) => {
  try {
    // fetch data from body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validate
    if (
      !firstName ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "ALl fields are required",
      });
    }

    // confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and ConfirmPassword Value does not match, please try again",
      });
    }
    // check if user already exists
    const existingUSer = await User.findOne({ emial });
    if (existingUSer) {
      return res.status(400).json({
        success: false,
        message: "User is alreadyt registered",
      });
    }
    // find most recent OTP stored for the user
    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    // validate Otp
    if (recentOtp.length == 0) {
      // OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP Not Found",
      });
    } else if (otp !== recentOtp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // hash Password
    const hasedPassword = await bcrypt.hash(password, 10);

    // entry create in db

    const profileDetails = await Profiler.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hasedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return res

    return res.status(200).json({
      success: true,
      message: "User is Registered Sucessfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered , Please try again",
    });
  }
};

// login

exports.login = async (req, res) => {
  try {
    //    get data from req body
    const { email, password } = req.body;
    // validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required , please try again",
      });
    }
    // user check exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "USer is not registered , please signup first",
      });
    }
    // generate JWT, after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user.id,
        role: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRE, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      // create cookie and set response

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again",
    });
  }
};

// ChangePassword

exports.changePassword = async (req, res) => {
  // get data from body
  // get oldPassword , newpassword, confiempasswrd
  // validation
  // update  pwd in db
  // send email password update
  // return response
};
