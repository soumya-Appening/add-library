/* Third Party Libraries */
require('dotenv')
const _ = require("lodash");
const db = require('mongoose');
const moment = require('moment')
const bcrypt = require('bcrypt')
const ObjectId = db.Types.ObjectId
/* Third Party Libraries */

/* Local Files */
const Helper = require('../../../../helpers/helpers')
const BaseController = require('../../_base.controller');
/* Local Files */

/* Responses */
const UploaderProfileResponse = require('../../../responses/uploader-profile.response');
const { userTypes, adStatus, profileActivity } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
const FileUpload = require("../../../../config/fileUpload")
/* End Responses */

class ProfileController extends BaseController {
    constructor() {
        super()
    }

    createLead = async(req,res) => {
        const session = req.dbSession
        const response = new UploaderProfileResponse(req,res)
        this._leadRepository.setDBSession(session)

        try {
            let body = _.pick(req.body,["email","name"]);
            
            let salt = 10;
            let hashPassword = bcrypt.hashSync(req.body.password,salt);
            body.password = hashPassword;

            let lead = await this._leadRepository.createOrUpdateById(null,body);
            return response.postDataResponse(lead)
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getProfile = async(req,res) => {
        const session = req.dbSession
        const response = new UploaderProfileResponse(req,res)
        this._userRepository.setDBSession(session)
        const user = req.user

        try {
            let uploader = await this._userRepository.findOne({_id: user._id});
            return response.postDataResponse(uploader)
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    updateProfile = async(req,res) => {
        const session = req.dbSession
        const response = new UploaderProfileResponse(req,res)
        this._userRepository.setDBSession(session)
        const user = req.user

        try {
            let body = _.pick(req.body,["name","avatar"]);
            let uploader = await this._userRepository.createOrUpdateById(user._id,body);
            return response.postDataResponse(uploader)
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    removeProfile = async(req,res) => {
        const session = req.dbSession
        const response = new UploaderProfileResponse(req,res)
        this._userRepository.setDBSession(session)
        const user = req.user

        try {
            let body = {
                status: profileActivity.INACTIVE
            }
            let uploader = await this._userRepository.createOrUpdateById(user._id,body);
            return response.postDataResponse(uploader)
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

}

module.exports = new ProfileController()
