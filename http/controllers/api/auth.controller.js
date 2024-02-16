/* Third Party Libraries */
require("dotenv");
const _ = require("lodash");
const db = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
/* Third Party Libraries */

/* Local Files */
const Helper = require("../../../helpers/helpers");
const BaseController = require("../_base.controller");
/* Local Files */

/* Responses */
const AuthResponse = require("../../responses/auth.response");
const { userTypes, profileActivity } = require("../../../helpers/constants");
const BadRequestError = require("../../../exceptions/badRequest.exception");
// const { default: generateTokenJWT } = require('../../../utils/generateTokenJwt');
const helpers = require("../../../helpers/helpers");
const { sendEmail } = require("../../../helpers/send_email");
// const generateTokenJwt = require('../../../utils/generateTokenJwt');
/* End Responses */

class AuthController extends BaseController {
  constructor() {
    super();
    this.generateOTP = "";
    this.userPasswordResetDetails = null;
  }

  login = async (req, res) => {
    const response = new AuthResponse(req, res);
    const session = req.dbSession;
    this._userRepository.setDBSession(session);
    try {
      let { email, password } = _.pick(req.body, ["email", "password"]);

      let user = await this._userRepository.findOne({ email });
      const match = bcrypt.compareSync(password, user.password);
      if (!match) {
        throw new BadRequestError("Incorrect password");
      }
      return response.postDataResponse(user);
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };

  adminLogin = async (req, res) => {
    const response = new AuthResponse(req, res);
    const session = req.dbSession;
    this._userRepository.setDBSession(session);
    try {
      let { email, password } = _.pick(req.body, ["email", "password"]);

      let user = await this._userRepository.findOne({
        email,
        $or: [{ role: userTypes.ADMIN }, { role: userTypes.SUPERVISOR }]
      });
      if (!user) {
        throw new BadRequestError("user not found");
      }
      const match = bcrypt.compareSync(password, user.password);
      if (!match) {
        throw new BadRequestError("Incorrect password");
      }
      if (user.status === profileActivity.INACTIVE) {
        throw new BadRequestError("Profile deleted");
      }
      return response.postDataResponse(user);
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };

  register = async (req, res) => {
    const response = new AuthResponse(req, res);
    const session = req.dbSession;
    this._userRepository.setDBSession(session);
    try {
      let { email, password, name } = _.pick(req.body, [
        "email",
        "password",
        "name"
      ]);

      let saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      const body = {
        email,
        password: hashedPassword,
        name,
        role: userTypes.ADMIN
      };

      let admin = await this._userRepository.createOrUpdateById(null, body);
      return response.postDataResponse(admin);
    } catch (e) {
      return response.internalServerErrorResponse(e);
    }
  };

  // Forget Password controller
  forgetPassword = async (req, res) => {
    const response = new AuthResponse(req, res);
    const session = req.dbSession;
    this._userRepository.setDBSession(session);

    try {
      let { email } = _.pick(req.body, ["email"]);
      console.log("Email: ", email);

      let user = await this._userRepository.findOne({
        email: email.toString().trim()
      });

      if (!user) {
        throw new BadRequestError("User doesn't exist!");
      }

      this.generateOTP = String(helpers.generateOTP());
      this.userPasswordResetDetails = { userId: user._id, email: user.email };
      console.log(
        "userPasswordResetDetails set: ",
        this.userPasswordResetDetails
      );

      // Store userPasswordResetDetails in the session
      req.dbSession.userPasswordResetDetails = this.userPasswordResetDetails;
      console.log("Full session: ", req.dbSession);
      console.log("Forget pass session: ", req.dbSession.userPasswordResetDetails);

      await sendEmail({
        email: email,
        otp: this.generateOTP,
        name: user.name,
        subject: "Reset your password"
      });

      return response.okResponse(200, "OTP sent successfully.", user);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return response.badRequestResponse(error);
      }
      return response.internalServerErrorResponse(error);
    }
  };

  // Verify otp controller
  verifyOtp = async (req, res) => {
    const response = new AuthResponse( req, res );
    const session = req.dbSession;
    this._userRepository.setDBSession(session);
    const { userOtp } = _.pick(req.body, ["userOtp"]);

    try {
    
      // const { email } = req.dbSession.userPasswordResetDetails;
      // console.log(
      //   "VErify otp session: ",
      //   req.dbSession.userPasswordResetDetails
      // );

      // if (!email) {
      //   throw new BadRequestError("User details not found.");
      // }

      // const user = await this._userRepository.findOne({
      //   email: email.toString().trim()
      // });

      // if (!user) {
      //   throw new BadRequestError("User not found.");
      // }

      // const storedHashedOtp = user.otp;
     
      // const match = await bcrypt.compare(userOtp.trim(), storedHashedOtp);

      if (this.generateOTP.toString().trim() === userOtp.toString().trim()) {
        return response.okResponse(200, "Otp verification successful!");
      } else {
        throw new BadRequestError("Otp didn't match!");
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        return response.badRequestResponse(error);
      }
      return response.internalServerErrorResponse(error);
    }
  };

  // Resend OTP controller
  resendOtp = async (req, res) => {
    const response = new AuthResponse(req, res);
    const session = req.dbSession;
    this._userRepository.setDBSession(session);

    try {
      let { email } = _.pick(req.body, ["email"]);
      console.log("Email: ", email);

      let user = await this._userRepository.findOne({
        email: email.toString().trim()
      });

      if (!user) {
        throw new BadRequestError("User doesn't exist!");
      }

      // Generate a new OTP
      this.generateOTP = String(helpers.generateOTP());

      // Update user's OTP details
      const updatedUser = await this._userRepository.findAndUpdate(user._id, {
        $set: {
          otp: newOtp,
          otpGeneratedAt: moment(),
          otpVerified: false
        }
      });

      // Send the new OTP via email
      await sendEmail({
        email: email,
        otp: this.generateOTP,
        name: user.name,
        subject: "Resend OTP for Resetting your Password"
      });

      return response.okResponse(
        200,
        "New OTP sent successfully.",
        updatedUser
      );
    } catch (error) {
      if (error instanceof BadRequestError) {
        return response.badRequestResponse(error);
      }
      return response.internalServerErrorResponse(error);
    }
  };

  // Reset Password controller
  resetPassword = async (req, res) => {
    const response = new AuthResponse(req, res);
    const session = req.dbSession;
    this._userRepository.setDBSession(session);

    if (!this.userPasswordResetDetails) {
      throw new BadRequestError(
        "User details not found. Please re-initiate the password reset process."
      );
    }

    console.log("email: ", this.userPasswordResetDetails);

    try {
      const { password } = _.pick(req.body, ["password"]);
      console.log("Password: ", password);

      const incomingUser = await this._userRepository.findOne({
        email: this.userPasswordResetDetails.email
      });
      console.log("Incoming User: ", incomingUser);

      if (!incomingUser) {
        throw new BadRequestError("No account associated with provided email");
      }

      const match = bcrypt.compareSync(password, incomingUser.password);
      console.log("Password Match: ", match);

      if (match) {
        throw new BadRequestError("You can't use the old password!");
      }

      const saltRounds = 10;
      const securePassword = bcrypt.hashSync(password, saltRounds);
      console.log("Secured Password: ", securePassword);

      const newUser = await this._userRepository.findAndUpdate(
        incomingUser._id,
        {
          $set: {
            password: securePassword
          }
        },
        {
          $unset: {
            token: 1
          }
        }
      );
      console.log("updated User: ", newUser);

      this.userPasswordResetDetails = null;

      return response.okResponse(
        201,
        "Password has been updated successfully",
        newUser
      );
    } catch (error) {
      if (error instanceof BadRequestError) {
        return response.badRequestResponse(error);
      }
      return response.internalServerErrorResponse(error);
    }
  };
}

module.exports = new AuthController();
