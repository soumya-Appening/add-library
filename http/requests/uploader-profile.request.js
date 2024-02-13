const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { default: axios } = require("axios");
const url = require('url');

const constants = require("../../helpers/constants");
const BaseRequest = require("./_base.request");
const LeadModel = require("../../models/lead.model")

const { validateDate } = require("../../helpers/validation/dateTimeValidation.helper");


class ProfileRequest extends BaseRequest {
    getCreateLeadRules() {
        return [
            bodyValidator(["email"]).exists().isEmail().custom(async (value, { req }) => {
                const admin = await LeadModel.findOne({
                    email: value
                })
                if (admin) {
                    throw new Error('email already exists.')
                }
                return true;
            }),
            bodyValidator(["name"]).exists(),
            bodyValidator(["password"]).exists()
        ];
    }

    getAvatarUploadRules() {
        return [
            bodyValidator(["email"]).exists().isEmail().custom(async (value, { req }) => {
                const lead = await LeadModel.findOne({
                    email: value
                })
                if (!lead) {
                    throw new Error('email not found.')
                }
                return true;
            }),
            bodyValidator(["extension"]).exists()
        ];
    }

}

module.exports = new ProfileRequest()