const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { default: axios } = require("axios");
const url = require('url');

const constants = require("../../helpers/constants");
const BaseRequest = require("./_base.request");
const UserModel = require("../../models/user.model")


class DashBoardRequest extends BaseRequest {
    getAdsRules(){
        return [
            queryValidator(["id"]).optional().isMongoId(),
            queryValidator(["status"]).optional().isIn(Object.values(constants.adStatus))
        ]
    }
    getInfluencerDetailRules(){
        return [
            paramValidator(["id"]).exists().isMongoId(),
            this.validate
        ]
    }
}

module.exports = new DashBoardRequest()