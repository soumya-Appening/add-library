/* Third Party Libraries */
require('dotenv')
const _ = require("lodash");
const db = require('mongoose');
const moment = require('moment')
const bcrypt = require('bcrypt')
/* Third Party Libraries */

/* Local Files */
const Helper = require('../../../../helpers/helpers')
const BaseController = require('../../_base.controller');
/* Local Files */

/* Responses */
const AdminResponse = require('../../../responses/admin.response');
const { userTypes } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
/* End Responses */

class InfluencerController extends BaseController {
    constructor() {
        super()
    }

    addInfluencer = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._influencerRepository.setDBSession(session)
        try {
            let {
                name,
                insta_username,
                snapchat_username,
                uploader
            } = _.pick(req.body, ["name","insta_username","snapchat_username","uploader"]);

            let isInfluencerExist = await this._influencerRepository.findOne({
                $or: [
                    { insta_username: insta_username },
                    { snapchat_username: snapchat_username }
                ]
            })
            
            if(isInfluencerExist){
                throw new BadRequestError("Influencer Already exist")
            }

            const body = {
                name,
                insta_username,
                snapchat_username,
                uploader,
                createdBy: user._id
            }

            let influencer = await this._influencerRepository.createOrUpdateById(null, body)

            return response.postDataResponse(influencer);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getInfluencerList = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._influencerRepository.setDBSession(session)
        try {
            let match = {
                createdBy: user._id
            };
           
            let data;
            if (req.query.id) {
                match._id = req.query.id
                data = await this._influencerRepository.findOne(match)

                if (!data) {
                    throw new Error('Invalid id!')
                }
            } else {
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
                let sort = {
                    field: 'createdAt', order: -1
                }
                if(req.query.sort && req.query.sort.field && req.query.sort.order){
                    if(req.query.sort.field == 'uploader'){
                        req.query.sort.field = 'uploader.name'
                    }
                    sort = {
                        field: req.query.sort.field, order: Number(req.query.sort.order)
                    }
                }
                let lookup1 = {
                    $lookup: {
                      from: 'users', 
                      localField: 'uploader',
                      foreignField: '_id',
                      as: 'uploader',
                      pipeline:[
                        {
                            $project:{
                                name: 1
                            }
                        }
                      ]
                    }
                }

                let lookup = [ lookup1 ]

                let addFields = {
                    uploader: { $first: '$uploader' },
                }

                const paginator = {
                    page: Number(req.query.page) || 1,
                    filters: {
                        match: match
                    },
                    lookup,
                    addFields,
                    sort
                }

                data = await this._influencerRepository.getAll(paginator)
            }

            return response.postDataResponse(data);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    getInfluencers = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._influencerRepository.setDBSession(session)
        try {
            let match = {
                createdBy: user._id
            };
           
            let data;
           
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
               

                const paginator = {
                    page: Number(req.query.page) || 1,
                    filters: {
                        match: match
                    },
                    project:{
                        "name": 1
                    }
                }

                data = await this._influencerRepository.getAll(paginator)

            return response.postDataResponse(data);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    updateInfluencer = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._influencerRepository.setDBSession(session)
        try {
            let body = _.pick(req.body, ["name","insta_username","snapchat_username","uploader","status"]);
            let id = req.params.id

            let influencer = await this._influencerRepository.findOne({
                _id: id,
                createdBy: user._id
            })
            if (!influencer) {
                throw new BadRequestError('Invalid id')
            }

            if (body.insta_username) {
                let instaExist = await this._influencerRepository.findOne({
                    insta_username: body.insta_username,
                    _id: { $ne: id }
                })
                if (instaExist) {
                    throw new Error('instagram username already exists.')
                }
            }

            if (body.snapchat_username) {
                let snapExist = await this._influencerRepository.findOne({
                    snapchat_username: body.snapchat_username,
                    _id: { $ne: id }
                })
                if (snapExist) {
                    throw new Error('Snapchat username already exists.')
                }
            }

            let data = await this._influencerRepository.createOrUpdateById(id,body )

            return response.postDataResponse(data);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    removeInfluencer = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._influencerRepository.setDBSession(session)
        try {
            let id = req.query.id;

            let influencer = await this._influencerRepository.findOne({
                _id: id,
                createdBy: user._id
            })
            if (!influencer) {
                throw new BadRequestError('Invalid id')
            }

            await this._influencerRepository.findAndDelete(
                {
                    query: {
                        _id: id,
                        createdBy: user._id
                    }
                }
            )

            return response.postDataResponse("Deleted successfully");
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new InfluencerController()