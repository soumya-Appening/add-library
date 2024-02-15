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
const { userTypes, adStatus } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
/* End Responses */

class SuperVisorController extends BaseController {
    constructor() {
        super()
    }

    createSuperVisor = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        console.log("Session: ", session);
        const user = req.user
        console.log("User: ", user);
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                password,
                name,
                avatar
            } = _.pick( req.body, [ "email", "password", "name", "avatar" ] );
            console.log(email, password, name, avatar);

            let saltRounds = 10;
            const hashedPassword = bcrypt.hashSync( password, saltRounds );
            console.log(hashedPassword);

            const body = {
                email,
                password: hashedPassword,
                name,
                user: user._id,
                role: userTypes.SUPERVISOR,
                createdBy: user._id
            }
            console.log("Body: ", body);
            
            let admin = await this._userRepository.createOrUpdateById(null, body)
            console.log("Admin: ", admin);

            return response.postDataResponse(admin);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    getSuperVisorList = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let match = {
                createdBy: user._id,
                role: userTypes.SUPERVISOR
            };
            let data;
            if (req.query.id) {
                match._id = req.query.id
                data = await this._userRepository.findOne(match)

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
                    sort = {
                        field: req.query.sort.field, order: Number(req.query.sort.order)
                    }
                }

                let lookup1 = {
                    $lookup: {
                        from: 'supervisoruploaders',
                        localField: '_id',
                        foreignField: 'superVisorId',
                        as: 'uploaders',
                    }
                }

                let lookup2 = {
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
                        let: { supervisorId: "$_id", status: status },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$supervisorId", "$$supervisorId"] },
                                                { $eq: ["$status", "$$status"] }
                                            ]
                                    }
                                }
                            }
                        ],
                        as: as,
                    }
                })

                let lookup3 = createLookupStage(adStatus.REJECT, 'rejectedAds');
                let lookup4 = createLookupStage(adStatus.ACCEPT, 'acceptedAds');
                let lookup5 = createLookupStage(adStatus.UPLOAD, 'pendingAds');

                let lookup = [lookup1, lookup2, lookup3, lookup4, lookup5]

                let addFields = {
                    totalUploaders: {
                        $cond: {
                            if: { $ifNull: ["$uploaders", false] },
                            then: { $size: "$uploaders.uploader" },
                            else: 0 
                        }
                    },
                    totalAdReviewed: { $size: '$ads' },
                    totalRejectedAds: { $size: '$rejectedAds' },
                    totalAcceptedAds: { $size: '$acceptedAds' },
                    totalPendingAds: { $size: '$pendingAds' }
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
                    "totalUploaders": 1,
                    "totalAdReviewed": 1,
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

    updateSuperVisor = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let body = _.pick(req.body, ["email", "name", "status", "password","avatar"]);
            let id = req.params.id;

            let supervisor = await this._userRepository.findOne({
                _id: id,
                createdBy: user._id,
                role: userTypes.SUPERVISOR
            })
            if (!supervisor) {
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
                        role: userTypes.SUPERVISOR
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

    removeSuperVisor = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let id = req.params.id;

            let supervisor = await this._userRepository.findOne({
                _id: id,
                createdBy: user._id,
                role: userTypes.SUPERVISOR
            })
            if (!supervisor) {
                throw new BadRequestError('Invalid id')
            }

            await this._userRepository.findAndDelete(
                {
                    query: {
                        _id: id,
                        createdBy: user._id,
                        role: userTypes.SUPERVISOR
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

    getSupervisor = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
            let match = {
                createdBy: user._id,
                role: userTypes.SUPERVISOR
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
            let supervisor = await this._userRepository.getAll(paginator)

            return response.postDataResponse(supervisor);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new SuperVisorController()