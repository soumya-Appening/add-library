/* Third Party Libraries */
require('dotenv')
const _ = require("lodash");
const db = require('mongoose');
const moment = require('moment')
const bcrypt = require('bcrypt')
/* Third Party Libraries */

/* Local Files */
const Helper = require('../../../helpers/helpers')
const BaseController = require('../_base.controller');
/* Local Files */

/* Responses */
const AuthResponse = require('../../responses/auth.response');
const { userTypes, profileActivity } = require('../../../helpers/constants');
const BadRequestError = require('../../../exceptions/badRequest.exception');
/* End Responses */

class AuthController extends BaseController {
    constructor() {
        super()
    }

    login = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                password
            } = _.pick(req.body, ["email", "password"]);

            let user = await this._userRepository.findOne({ email });
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
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    adminLogin = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                password
            } = _.pick(req.body, ["email", "password"]);

            let user = await this._userRepository.findOne({
                email, $or: [
                    { role: userTypes.ADMIN },
                    { role: userTypes.SUPERVISOR }
                ]
            });
            if (!user) {
                throw new BadRequestError("user not found")
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
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    register = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                password,
                name
            } = _.pick(req.body, ["email", "password", "name"]);

            let saltRounds = 10;
            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            const body = {
                email,
                password: hashedPassword,
                name,
                role: userTypes.ADMIN
            }

            let admin = await this._userRepository.createOrUpdateById(null, body)
            return response.postDataResponse(admin);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    forgotPassword = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
            } = _.pick(req.body, ["email"]);

            let user = await this._userRepository.findOne({ email: email })
            let body = {
                // otp: Helper.generateOTP(),
                otp: '12345',
                otpGeneratedAt: moment(),
                otpVerified: false
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse(updatedUser);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    forgotAdminPassword = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
            } = _.pick(req.body, ["email"]);

            let user = await this._userRepository.findOne({
                email, 
                $or: [
                    { role: userTypes.ADMIN },
                    { role: userTypes.SUPERVISOR }
                ]
            })
            if(!user){
                throw new BadRequestError('User not found')
            }
            let body = {
                // otp: Helper.generateOTP(),
                otp: '12345',
                otpGeneratedAt: moment(),
                otpVerified: false
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse(updatedUser);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    resendAdminOtp = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
            } = _.pick(req.body, ["email"]);

            let user = await this._userRepository.findOne({
                email, 
                $or: [
                    { role: userTypes.ADMIN },
                    { role: userTypes.SUPERVISOR }
                ]
            })
            if(!user){
                throw new BadRequestError('User not found')
            }
            let body = {
                // otp: Helper.generateOTP(),
                otp: '12345',
                otpGeneratedAt: moment(),
                otpVerified: false
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse(updatedUser);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    resendOtp = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
            } = _.pick(req.body, ["email"]);

            let user = await this._userRepository.findOne({
                email
            })
            if(!user){
                throw new BadRequestError('User not found')
            }
            let body = {
                // otp: Helper.generateOTP(),
                otp: '12345',
                otpGeneratedAt: moment(),
                otpVerified: false
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse(updatedUser);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    verifyOtp = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                otp
            } = _.pick(req.body, ["email", "otp"]);

            let user = await this._userRepository.findOne(null, { email: email, otp: otp })
            if (!user) {
                throw new BadRequestError("Invalid otp")
            }
            else if (user.otpVerified === true) {
                throw new BadRequestError("Already verified")
            }

            const differenceInVerifiedAt = moment().diff(user.otpGeneratedAt, 'minutes')
            if (differenceInVerifiedAt > 20) {
                throw new BadRequestError("otp expired")
            }
            let body = {
                otpVerified: true
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse(updatedUser);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    verifyAdminOtp = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                otp
            } = _.pick(req.body, ["email", "otp"]);

            let user = await this._userRepository.findOne(null, { 
                email: email, 
                otp: otp, 
                $or: [
                    { role: userTypes.ADMIN },
                    { role: userTypes.SUPERVISOR }
                ]
            })
            if (!user) {
                throw new BadRequestError("Invalid otp")
            }
            else if (user.otpVerified === true) {
                throw new BadRequestError("Already verified")
            }

            const differenceInVerifiedAt = moment().diff(user.otpGeneratedAt, 'minutes')
            if (differenceInVerifiedAt > 20) {
                throw new BadRequestError("otp expired")
            }
            let body = {
                otpVerified: true
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse(updatedUser);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    resetPassword = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                password
            } = _.pick(req.body, ["email", "password"]);

            let user = await this._userRepository.findOne(null, { email: email })
            if (!user) {
                throw new BadRequestError("Invalid otp")
            }
            else if (!user.otpVerified) {
                throw new BadRequestError("First verify your otp")
            }

            let hashPassword = bcrypt.hashSync(password, 10)

            let body = {
                password: hashPassword
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse("Password updated successfully");
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    resetAdminPassword = async (req, res) => {
        const response = new AuthResponse(req, res);
        const session = req.dbSession
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                password
            } = _.pick(req.body, ["email", "password"]);

            let user = await this._userRepository.findOne(null, { 
                email: email,
                $or: [
                    { role: userTypes.ADMIN },
                    { role: userTypes.SUPERVISOR }
                ] 
            })
            if (!user) {
                throw new BadRequestError("user not found")
            }
            else if (!user.otpVerified) {
                throw new BadRequestError("First verify your otp")
            }

            let hashPassword = bcrypt.hashSync(password, 10)

            let body = {
                password: hashPassword
            }

            let updatedUser = await this._userRepository.createOrUpdateById(user._id, body)

            return response.postDataResponse("Password updated successfully");
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

}

module.exports = new AuthController();
