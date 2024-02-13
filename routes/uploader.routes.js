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

/* Middleware*/
const ApiMiddleware = require("../http/middlewares/api");
/* End Middleware*/

/* Requests*/
const UploaderRequest = require("../http/requests/uploader.request");
const UploaderProfileRequest = require("../http/requests/uploader-profile.request");
/* End Requests*/

/* Controllers*/
const UploadController = require("../http/controllers/api/uploader/upload.controller");
const AdsController = require("../http/controllers/api/uploader/ads.controller");
const DashboardController = require("../http/controllers/api/uploader/dashboard.controller");
const ProfileController = require("../http/controllers/api/uploader/profile.controller");
/* End Controllers*/

const validate = UploaderRequest.validate;

Route.post("/register",UploaderProfileRequest.getCreateLeadRules(),validate,ProfileController.createLead)

Route.use(ApiMiddleware.uploaderAuth)

// upload routes
Route.get("/brands",  UploadController.getBrands);
Route.get("/products",  UploadController.getProducts)
Route.get("/influencers", UploadController.getInfluencer)
Route.get("/platforms", UploadController.getPlatform)
Route.post("/upload-ads", UploaderRequest.getUploadRules(), validate, UploadController.uploadAds)
Route.post("/video/upload", UploaderRequest.getUploadS3UrlRules(), validate, UploadController.getS3Url)
Route.put("/video-status/update/:id", UploaderRequest.getUploadVideoStatusRules(), validate, UploadController.updateVideoStatus)
//end of upload routes

//ads routes
Route.get("/ads/list",  UploaderRequest.getAdsRules(), validate, AdsController.getAds);
//end of ads routes

//dashboard apis
Route.get("/ads/total", DashboardController.getTotalAds)


//profile apis
Route.get("/profile", ProfileController.getProfile)
Route.put("/profile/update", ProfileController.updateProfile)
Route.put("/profile/delete", ProfileController.removeProfile)


module.exports = Route;
