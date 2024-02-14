const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { default: axios } = require("axios");
const url = require('url');

const constants = require("../../helpers/constants");
const BaseRequest = require("./_base.request");
const UserModel = require("../../models/user.model")


class AdminRequest extends BaseRequest {
  getLoginRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const auth = await UserModel.findOne({
            email: value
          });
          if (!auth) {
            throw new Error("email not found");
          }
          return true;
        }),
      bodyValidator(["password"]).exists()
    ];
  }

  getAdminLoginRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const auth = await UserModel.findOne({
            email: value,
            $or: [
              { role: constants.userTypes.ADMIN },
              { role: constants.userTypes.SUPERVISOR }
            ]
          });
          if (!auth) {
            throw new Error("user not found");
          }
          return true;
        }),
      bodyValidator(["password"]).exists()
    ];
  }

  getRegisterRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const admin = await UserModel.findOne({
            email: value
          });
          if (admin) {
            throw new Error("email already exists.");
          }
          return true;
        }),
      bodyValidator(["name"]).exists(),
      bodyValidator(["password"]).exists()
    ];
  }

    /*
  getForgotPasswordRules() {
      return [
          bodyValidator(["email"]).exists().isEmail().custom(async (value, { req }) => {
              const user = await UserModel.findOne({
                  email: value,
                  role: constants.userTypes.UPLOADER
              })
              if (!user) {
                  throw new Error('Email not found.')
              }
              return true;
          })
      ];
  }
  */

  getForgetPasswordRules() {
    return [
      bodyValidator("email")
        .exists()
        .isEmail()
        .custom(async (value) => {
          const auth = await UserModel.findOne({
            email: value
          });
          if (!auth) {
            throw new Error("Email not found");
          }
          return true;
        })
    ];
  }

  getResendOtpRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const user = await UserModel.findOne({
            email: value,
            role: constants.userTypes.UPLOADER
          });
          if (!user) {
            throw new Error("Email not found.");
          }
          return true;
        })
    ];
  }

  getForgotAdminPasswordRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const user = await UserModel.findOne({
            email: value,
            $or: [
              { role: constants.userTypes.ADMIN },
              { role: constants.userTypes.SUPERVISOR }
            ]
          });
          if (!user) {
            throw new Error("user not found.");
          }
          return true;
        })
    ];
  }

  getResendAdminOtpRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const user = await UserModel.findOne({
            email: value,
            $or: [
              { role: constants.userTypes.ADMIN },
              { role: constants.userTypes.SUPERVISOR }
            ]
          });
          if (!user) {
            throw new Error("user not found.");
          }
          return true;
        })
    ];
  }

  getVerifyOtpRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const user = await UserModel.findOne({
            email: value
          });
          if (!user) {
            throw new Error("Email not found.");
          }
          return true;
        }),
      bodyValidator(["otp"]).exists()
    ];
  }

  getVerifyAdminOtpRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const user = await UserModel.findOne({
            email: value,
            $or: [
              { role: constants.userTypes.ADMIN },
              { role: constants.userTypes.SUPERVISOR }
            ]
          });
          if (!user) {
            throw new Error("User not found.");
          }
          return true;
        }),
      bodyValidator(["otp"]).exists()
    ];
  }

  getResetPasswordRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const user = await UserModel.findOne({
            email: value
          });
          if (!user) {
            throw new Error("Email not found.");
          }
          return true;
        }),
      bodyValidator(["password"]).exists()
    ];
  }

  getAdminResetPasswordRules() {
    return [
      bodyValidator(["email"])
        .exists()
        .isEmail()
        .custom(async (value, { req }) => {
          const user = await UserModel.findOne({
            email: value,
            $or: [
              { role: constants.userTypes.ADMIN },
              { role: constants.userTypes.SUPERVISOR }
            ]
          });
          if (!user) {
            throw new Error("User not found.");
          }
          return true;
        }),
      bodyValidator(["password"]).exists()
    ];
  }
}

module.exports = new AdminRequest()