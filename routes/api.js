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

/* Local files*/
const FileUpload = require('../config/fileUpload')
/*End Local files*/

/* Requests*/
const UploaderRequest = require("../http/requests/uploader.request");
const UploaderProfileRequest = require("../http/requests/uploader-profile.request");
/* End Requests*/

/* Controllers*/
const FileController = require("../http/controllers/file.contoller");
/* End Controllers*/

const validate = UploaderRequest.validate;

Route.use(ApiMiddleware.auth)

Route.post("/upload/files",  FileUpload.files(FileController.expectedFiles()), FileController.uploadFiles);


module.exports = Route;
