const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { body } = require("express-validator");
const { default: axios } = require("axios");
const url = require('url');

const constants = require("../../helpers/constants");
const BaseRequest = require("./_base.request");
const UserModel = require("../../models/user.model")


class AdsRequest extends BaseRequest {

    getUpdateRules() {
        return [
            bodyValidator(["status"]).exists().isIn(Object.values(constants.adStatus)).toInt(),
            bodyValidator(["brandId"]).if(body('productId').exists()).exists(),
            bodyValidator(["productId"]).if(body('brandId').exists()).exists(),
        ];
    }
}

module.exports = new AdsRequest()