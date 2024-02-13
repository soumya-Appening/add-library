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
const AdminResponse = require('../../../responses/admin.response');
const { userTypes, adStatus } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
/* End Responses */

class UploaderController extends BaseController {
    constructor() {
        super()
    }

    createUploader = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        this._superVisorUploaderRepository.setDBSession(session)
        try {
            let {
                email,
                password,
                name,
                supervisor
            } = _.pick(req.body, ["email", "password", "name","supervisor","avatar"]);

            let supervisorExist = await this._userRepository.findOne({
                role: userTypes.SUPERVISOR,
                _id: supervisor,
                createdBy: user._id
           })
           if(!supervisorExist){
            throw new BadRequestError("Invalid supervisor")
           }

            let saltRounds = 10;
            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            const body = {
                email,
                password: hashedPassword,
                name,
                createdBy: user._id,
                role: userTypes.UPLOADER
            }

            let uploader = await this._userRepository.createOrUpdateById(null, body)
            let assignedBody = {
                $push: { uploaders: uploader._id }
            }
            let query = {
                superVisorId: supervisor
            }
            await this._superVisorUploaderRepository.findAndUpdate(query,assignedBody)
            return response.postDataResponse(uploader);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getUploaderList = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        console.log(user._id)
        try {
            let match = {
                createdBy: user._id,
                role: userTypes.UPLOADER
            };
            if(user.role === userTypes.SUPERVISOR){
                match['createdBy']= user.createdBy
            }

            let data;
            if (req.query.id) {
                match._id = req.query.id
                data = await this._userRepository.findOne(match)
                if (!data) {
                    throw new Error('Invalid id!')
                }
                let supervisor = await this._superVisorUploaderRepository.findOne({
                    uploaders: {
                        $in: [req.query.id]
                    }
                },'superVisorId -_id')
                data = {
                    ...data.toObject(),
                    supervisor: supervisor.superVisorId
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
                    if(req.query.sort.field === 'supervisor'){
                        req.query.sort.field = 'supervisor.name'
                    }
                    sort = {
                        field: req.query.sort.field, order: Number(req.query.sort.order)
                    }
                }
                let lookup1 = {
                    $lookup: {
                        from: 'supervisoruploaders',
                        localField: '_id',
                        foreignField: 'uploaders',
                        as: 'supervisorInfo',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'superVisorId',
                                    foreignField: '_id',
                                     pipeline: [
                                        {
                                            $project:{
                                                "name":1
                                            }
                                        }
                                    ],
                                    as: 'supervisor'
                                }
                            }
                        ]
                    }
                }
                let unwind1 = {
                    $unwind: {
                        path: '$supervisorInfo',
                        preserveNullAndEmptyArrays: true,
                    }
                }

                let lookup2 = {
                    $lookup: {
                        from: 'influencers',
                        localField: '_id',
                        foreignField: 'uploader',
                        as: 'influencer'
                    }
                }
                let lookup3 = {
                    $lookup: {
                        from: 'adsvideos',
                        localField: '_id',
                        foreignField: 'superVisorId',
                        as: 'ads',
                    }
                }
                
               
                let createLookupStage = (status, as) => ({
                    $lookup: {
                        from: 'adsvideos',
                        let: { uploaderId: "$_id", status: status },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$uploaderId", "$$uploaderId"] },
                                                { $eq: ["$status", "$$status"] }
                                            ]
                                    }
                                }
                            }
                        ],
                        as: as,
                    }
                })

                let lookup4 = createLookupStage(adStatus.REJECT, 'rejectedAds');
                let lookup5 = createLookupStage(adStatus.ACCEPT, 'acceptedAds');
                let lookup6 = createLookupStage(adStatus.UPLOAD, 'pendingAds');
                if(user.role === userTypes.SUPERVISOR){
                    lookup1['$lookup']['pipeline'].unshift({
                        $match: {
                            superVisorId: user._id
                        }
                    }) 
               }

                let lookup = [lookup1, unwind1, lookup2, lookup3, lookup4, lookup5, lookup6 ]
                if(user.role === userTypes.SUPERVISOR){
                    lookup.push({
                        $match: {
                            'supervisorInfo': { $exists: true, $ne: null }
                        }
                    })
                }

                let addFields = {
                    totalInfluencer: { $size: '$influencer' },
                    totalAdUploaded: { $size: '$ads' },
                    totalRejectedAds: { $size: '$rejectedAds' },
                    totalAcceptedAds: { $size: '$acceptedAds' },
                    totalPendingAds: { $size: '$pendingAds' },
                    supervisor: { $first: '$supervisorInfo.supervisor'}
                }

                let project = {
                    "_id": 1,
                    "name": 1,
                    "email": 1,
                    "status": 1,
                    "role": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "createdBy": 1,
                    "supervisor": 1,
                    "totalInfluencer": 1,
                    "totalAdUploaded": 1,
                    "totalRejectedAds": 1,
                    "totalAcceptedAds": 1,
                    "totalUploadedAds": 1
                }

                const paginator = {
                    page: Number(req.query.page) || 1,
                    filters: {
                        match: match
                    },
                    lookup,
                    addFields,
                    project,
                    sort
                }

                data = await this._userRepository.getAll(paginator)
            }

            return response.postDataResponse(data);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    updateUploader = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let body = _.pick(req.body, ["email", "name", "status"]);
            let id = req.params.id;

            let uploader = await this._userRepository.findOne({
                _id: id,
                createdBy: user._id,
                role: userTypes.UPLOADER
            })
            if (!uploader) {
                throw new BadRequestError('Invalid id')
            }

            if (body.email) {
                let emailExist = await this._userRepository.findOne({
                    email: body.email,
                    _id: { $ne: id }
                })
                if (emailExist) {
                    throw new Error('email already exists.')
                }
            }

            if (body.password) {
                let saltRounds = 10;
                const hashedPassword = bcrypt.hashSync(body.password, saltRounds);
                body.password = hashedPassword;
            }

            let data = await this._userRepository.findAndUpdate(
                {
                    query: {
                        _id: id,
                        createdBy: user._id,
                        role: userTypes.UPLOADER
                    },
                    updateQuery: body
                }
            )

            return response.postDataResponse(data);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    removeUploader = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let id = req.params.id;

            let uploader = await this._userRepository.findOne({
                _id: id,
                createdBy: user._id,
                role: userTypes.UPLOADER
            })
            if (!uploader) {
                throw new BadRequestError('Invalid id')
            }

            await this._userRepository.findAndDelete(
                {
                    query: {
                        _id: id,
                        createdBy: user._id,
                        role: userTypes.UPLOADER
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

    getUploader = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
            let match = {
                createdBy: user._id,
                role: userTypes.UPLOADER
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
            let uploader = await this._userRepository.getAll(paginator)

            return response.postDataResponse(uploader);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new UploaderController()