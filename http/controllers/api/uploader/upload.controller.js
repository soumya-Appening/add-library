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
const UploaderResponse = require('../../../responses/uploader.response');
const { userTypes, adStatus, profileActivity } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
const FileUpload = require("../../../../config/fileUpload")
/* End Responses */

class UploadController extends BaseController {
    constructor() {
        super()
    }

    getBrands = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
            let match = {
            };
            if (req.query.search) {
                match['$or'] = [
                    {
                        name: {
                            $regex: req.query.search,
                            $options: 'i'
                        }
                    }
                ]
            }
            let project = {
                "name": 1
            }
            const paginator = {
                page: Number(req.query.page) || 1,
                filters: {
                    match: match
                },
                limit: 50,
                project
            }
            let brand = await this._brandRepository.getAll(paginator)

            return response.postDataResponse(brand);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getProducts = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
            let match = {
                brand: db.Types.ObjectId(req.query.brandId)
            };
            if (req.query.search) {
                match['$or'] = [
                    {
                        name: {
                            $regex: req.query.search,
                            $options: 'i'
                        }
                    }
                ]
            }
            let project = {
                "name": 1
            }
            const paginator = {
                page: Number(req.query.page) || 1,
                filters: {
                    match: match
                },
                limit: 50,
                project
            }
            let product = await this._productRepository.getAll(paginator)

            return response.postDataResponse(product);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getInfluencer = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user
        console.log(user)

        try {
            let match = {
                createdBy : user.createdBy,
                uploader: user._id,
                status: profileActivity.ACTIVE
            };
            if (req.query.search) {
                match['$or'] = [
                    {
                        name: {
                            $regex: req.query.search,
                            $options: 'i'
                        }
                    }
                ]
            }
            let project = {
                "name": 1
            }
            const paginator = {
                page: Number(req.query.page) || 1,
                filters: {
                    match: match
                },
                project,
                limit: 50
            }
            let influencer = await this._influencerRepository.getAll(paginator)

            return response.postDataResponse(influencer);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getPlatform = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
            let match = {
                createdBy : user.createdBy
            };
            if (req.query.search) {
                match['$or'] = [
                    {
                        name: {
                            $regex: req.query.search,
                            $options: 'i'
                        }
                    }
                ]
            }
            let project = {
                "name": 1
            }
            const paginator = {
                page: Number(req.query.page) || 1,
                filters: {
                    match: match
                },
                limit: 50,
                project
            }
            let platform = await this._platformRepository.getAll(paginator)

            return response.postDataResponse(platform);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    uploadAds = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._adRepository.setDBSession(session)
        this._superVisorUploaderRepository.setDBSession(session)
        this._productRepository.setDBSession(session)
        this._brandRepository.setDBSession(session)
        this._influencerRepository.setDBSession(session)
        this._platformRepository.setDBSession(session)
        this._userRepository.setDBSession(session)

        try {
            let body = _.pick(req.body, ['platformId', 'influencerId', 'brandId', 'productId',
                'date', 'videoId', 'fileName', 'videoStatus'])

            let supervisor = await this._superVisorUploaderRepository.findOne({
                uploaders: { $in: [user._id] }
            }, 'superVisorId', {
                path: 'superVisorId',
                select: 'name'
            })

            let brand = await this._brandRepository.findOne({ _id: body.brandId }, 'name');
            if (!brand) {
                throw new BadRequestError('Invalid brand')
            }

            let product = await this._productRepository.findOne({ 
                _id: body.productId,
                brand: body.brandId 
            }, 'name');
            if (!product) {
                throw new BadRequestError('Invalid product')
            }

            let platform = await this._platformRepository.findOne({ _id: body.platformId }, 'name');
            if (!platform) {
                throw new BadRequestError('Invalid platform')
            }

            let influencer = await this._influencerRepository.findOne({
                _id: body.influencerId,
                uploader: user._id
            }, 'name');
            if (!influencer) {
                throw new BadRequestError('Invalid influencer')
            }

            body.productName = product.name;
            body.brandName = brand.name;
            body.platformName = platform.name;
            body.uploaderName = user.name;
            body.uploaderId = user._id;
            body.supervisorId = supervisor.superVisorId._id;
            body.supervisorName = supervisor.superVisorId.name;
            body.influencerName = influencer.name;
            let ads = await this._adRepository.createOrUpdateById(null, body)
            return response.postDataResponse(ads);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getS3Url = async(req,res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user
        try {
            let extension = req.body.extension;
            let username = user.name.split(" ").join("_")
            let fileName = `${username}_${Date.now()}.${extension}`;
            const url = await FileUpload.getPresignUrlPromiseFunction(fileName);
            return response.postDataResponse(url);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    updateVideoStatus = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._adRepository.setDBSession(session)
        try {
            let ads = await this._adRepository.findOne({
                _id: req.params.id,
                uploaderId: user._id
            })
            if (!ads) {
                throw new BadRequestError("Invalid ad")
            }
            const updatedAds = await this._adRepository.createOrUpdateById(req.params.id,{
                videoStatus: req.body.status
            })
            return response.postDataResponse(updatedAds);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

}

module.exports = new UploadController()
