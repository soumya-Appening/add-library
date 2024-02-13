const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { body } = require("express-validator");
const { default: axios } = require("axios");
const url = require('url');

const constants = require("../../helpers/constants");
const BaseRequest = require("./_base.request");
const UserModel = require("../../models/user.model")


class ChartRequest extends BaseRequest {

    getChartAdsRules() {
        return [
            queryValidator(["fromDate"]).exists(),
            queryValidator(["toDate"]).exists(),
            this.validate
        ];
    }
    getChartTop5Rules() {
        return [
            queryValidator(["fromDate"]).exists(),
            queryValidator(["toDate"]).exists(),
            this.validate
        ];
    }
}

module.exports = new ChartRequest()