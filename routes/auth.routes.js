const express = require("express");
const Route = express.Router();

/**
 * 
 * Bad Request Error Response
 * @typedef {object} BadRequestResponse
 * @property {number} status -status code
 * @property {string} statusText - status code in text
 * @property {string} statusText - error message
 *
 */
/** 
* Internal Server Error Response
* @typedef {object} internalServerErrorResponse
* @property {string} url -url
* @property {number} status - status code
* @property {string} statusText - error message
*/

/* Local files*/
/*End Local files*/

/* Requests*/
const AuthRequest = require("../http/requests/auth.request");
/* End Requests*/

/* Controllers*/
const AuthController = require("../http/controllers/api/auth.controller");
/* End Controllers*/

const validate = AuthRequest.validate;

//Auth routes
Route.post("/login", AuthRequest.getLoginRules(), validate, AuthController.login);
// Route.post("/forgot-password", AuthRequest.getForgotPasswordRules(), validate, AuthController.forgotPassword);
Route.post("/forget-password", AuthRequest.getForgetPasswordRules(), validate, AuthController.forgetPassword);
// Route.post("/resend-otp", AuthRequest.getResendOtpRules(), validate, AuthController.resendOtp);
// Route.post("/verify-otp", AuthRequest.getVerifyOtpRules(), validate, AuthController.verifyOtp);
Route.post("/verify-otp", validate, AuthController.verifyOtp);
// Route.post("/reset-password", AuthRequest.getResetPasswordRules, validate, AuthController.resetPassword);
Route.post("/reset-password", AuthController.resetPassword);
//End auth routes

Route.post("/admin/login", AuthRequest.getAdminLoginRules(), validate, AuthController.adminLogin);
Route.post("/admin/register", AuthRequest.getRegisterRules(), validate, AuthController.register);
// Route.post("/admin/forgot-password", AuthRequest.getForgotAdminPasswordRules(), validate, AuthController.forgotAdminPassword);
// Route.post("/admin/resend-otp", AuthRequest.getResendAdminOtpRules(), validate, AuthController.resendAdminOtp);
// Route.post("/admin/verify-otp", AuthRequest.getVerifyAdminOtpRules(), validate, AuthController.verifyAdminOtp);
// Route.post("/admin/reset-password", AuthRequest.getAdminResetPasswordRules(), validate, AuthController.resetAdminPassword);

module.exports = Route;
