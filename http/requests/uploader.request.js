const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { default: axios } = require("axios");
const url = require('url');

const constants = require("../../helpers/constants");
const BaseRequest = require("./_base.request");
const LeadModel = require("../../models/lead.model")

const { validateDate } = require("../../helpers/validation/dateTimeValidation.helper");


class UploaderRequest extends BaseRequest {
    getAdsRules() {
        return [
            queryValidator(["id"]).optional().isMongoId(),
            queryValidator(["status"]).optional().isIn(Object.values(constants.adStatus))
        ]
    }
    getUploadRules() {
        return [
            bodyValidator(["platformId"]).exists().isMongoId(),
            bodyValidator(["influencerId"]).exists().isMongoId(),
            bodyValidator(["brandId"]).exists().isMongoId(),
            bodyValidator(["productId"]).exists().isMongoId(),
            bodyValidator(["fileName"]).exists(),
            bodyValidator(['date']).exists().custom((value, { req }) => {
                if (!validateDate(value)) {
                    throw new Error("invalid date format");
                }
                return true;
            })
        ]
    }

    getUploadVideoStatusRules() {
        return [
            paramValidator(["id"]).exists().isMongoId(),
            bodyValidator(["status"]).exists().isIn(Object.values(constants.videoStatus))
        ]
    }

    getUploadS3UrlRules() {
        return [
            bodyValidator(["extension"]).exists()
        ]
    }

    getProductListRules() {
        return [
            queryValidator(["brandId"]).exists(),
            this.validate
        ]
    }

}

module.exports = new UploaderRequest()