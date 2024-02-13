const bodyValidator = require("express-validator").body;
const queryValidator = require("express-validator").query;
const paramValidator = require("express-validator").param;
const { default: axios } = require("axios");
const url = require('url');

const constants = require("../../helpers/constants");
const BaseRequest = require("./_base.request");
const UserModel = require("../../models/user.model")
const BrandModel = require("../../models/brand.model")


class AdminRequest extends BaseRequest {

    getAddAdminRules() {
        return [
            bodyValidator(["email"]).exists().isEmail().custom(async (value, { req }) => {
                const admin = await UserModel.findOne({
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

    getAdminRules(){
        return [
            queryValidator(["id"]).optional().isMongoId()
        ]
    }

    getUpdateAdminRules(){
        return [
            paramValidator(["id"]).exists().isMongoId(),
            bodyValidator(["email"]).optional().isEmail()
        ]
    }

    getDeleteAdminRules(){
        return [
           paramValidator(["id"]).exists().isMongoId()
        ]
    }

    getAddSupervisorRules() {
        return [
            bodyValidator(["email"]).exists().isEmail().custom(async (value, { req }) => {
                const admin = await UserModel.findOne({
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

    getSupervisorRules(){
        return [
            queryValidator(["id"]).optional().isMongoId()
        ]
    }

    getUpdateSupervisorRules(){
        return [
            paramValidator(["id"]).exists().isMongoId(),
            bodyValidator(["email"]).optional().isEmail()
        ]
    }

    getDeleteSupervisorRules(){
        return [
            paramValidator(["id"]).exists().isMongoId()
        ]
    }

    getAddUploaderRules() {
        return [
            bodyValidator(["email"]).exists().isEmail().custom(async (value, { req }) => {
                const admin = await UserModel.findOne({
                    email: value
                })
                if (admin) {
                    throw new Error('email already exists.')
                }
                return true;
            }),
            bodyValidator(["name"]).exists(),
            bodyValidator(["password"]).exists(),
            bodyValidator(["supervisor"]).exists().isMongoId()
        ];
    }

    getUploaderRules(){
        return [
            queryValidator(["id"]).optional().isMongoId()
        ]
    }

    getUpdateUploaderRules(){
        return [
            paramValidator(["id"]).exists().isMongoId(),
            bodyValidator(["email"]).optional().isEmail()
        ]
    }

    getDeleteUploaderRules(){
        return [
           paramValidator(["id"]).exists().isMongoId()
        ]
    }

    getAddBrandRules(){
        return [
            bodyValidator(["name"]).exists()
        ]
    }

    getAddProductRules(){
        return [
            bodyValidator(["name"]).exists(),
            bodyValidator(["brandId"]).exists().isMongoId().custom(async(value,{req})=>{
                const brand = await BrandModel.findOne({
                    _id: value
                })
                if (!brand) {
                    throw new Error('invalid brand id.')
                }
                return true;
            })
        ]
    }

    getProductRules(){
        return [
            queryValidator(["brandId"]).exists().isMongoId(),
            this.validate
        ]
    }

    getAddPlatformRules(){
        return [
            bodyValidator(["name"]).exists(),
            bodyValidator(["url"]).exists()
        ]
    }

    getAddInfluencerRules(){
        return [
            bodyValidator(["name"]).exists(),
            bodyValidator(["snapchat_username"]).exists(),
            bodyValidator(["insta_username"]).exists(),
            bodyValidator(["uploader"]).exists().isMongoId().custom(async(value,{req})=>{
                const uploader = await UserModel.findOne({
                    _id: value,
                    role: constants.userTypes.UPLOADER
                })
                if (!uploader) {
                    throw new Error('invalid uploader.')
                }
                return true;
            }),
        ]
    }

    getInfluencerRules(){
        return [
            queryValidator(["id"]).optional().isMongoId()
        ]
    }

    getUpdateInfluencerRules(){
        return [
            paramValidator(["id"]).exists().isMongoId()
        ]
    }

    getDeleteInfluencerRules(){
        return [
            paramValidator(["id"]).exists().isMongoId()
        ]
    }


}

module.exports = new AdminRequest()