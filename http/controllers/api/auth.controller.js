auth.controller.js
___________________


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
const { userTypes } = require("../../../helpers/constants");
const BadRequestError = require("../../../exceptions/badRequest.exception");
// const { default: generateTokenJWT } = require('../../../utils/generateTokenJwt');
const helpers = require("../../../helpers/helpers");
const { send_email_template } = require( "../../../helpers/send_email_template" );
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

  register = async (req, res) => {
    const response = new AuthResponse(req, res);
    const session = req.dbSession;
    this._userRepository.setDBSession(session);
    try {
      let { email, password, name } = _.pick(req.body, [
        "email",
        "password",
        "name",
      ]);

      let saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      const body = {
        email,
        password: hashedPassword,
        name,
        role: userTypes.ADMIN,
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

      let user = await this._userRepository.findOne({ email });

      if (!user) {
        throw new BadRequestError("User doesn't exist!");
      }

      this.generateOTP = String(helpers.generateOTP());
      this.userPasswordResetDetails = { userId: user._id, email: user.email };
      console.log(
        "userPasswordResetDetails set: ",
        this.userPasswordResetDetails
      );

      await send_email_template({
        email: email,
        otp: this.generateOTP,
        name: user.name,
        subject: "Reset your password",
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
    const response = new AuthResponse(req, res);
    const { userOtp } = _.pick(req.body, ["userOtp"]);
    console.log("User Otp: ", userOtp);
    console.log("Generated Otp: ", this.generateOTP);

    if (this.generateOTP.trim() === userOtp.trim()) {
      return response.okResponse(200, "Otp verification successful!");
    } else {
      throw new BadRequestError("Otp didn't match!");
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
        email: this.userPasswordResetDetails.email,
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
            password: securePassword,
          },
        },
        {
          $unset: {
            token: 1,
          },
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