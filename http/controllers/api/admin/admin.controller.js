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

class AdminController extends BaseController {
    constructor() {
        super()
    }

    createAdmin = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let {
                email,
                password,
                name
            } = _.pick(req.body, ["email", "password", "name","avatar"]);

            let saltRounds = 10;
            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            const body = {
                email,
                password: hashedPassword,
                name,
                createdBy: user._id,
                role: userTypes.ADMIN
            }

            let admin = await this._userRepository.createOrUpdateById(null, body)

            return response.postDataResponse(admin);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    getAdmin = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let match = {
                createdBy: user._id,
                role: userTypes.ADMIN
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
            let sort = {
                field: 'createdAt', order: -1
            }
            if(req.query.sort && req.query.sort.field && req.query.sort.order){
                sort = {
                    field: req.query.sort.field, order: Number(req.query.sort.order)
                }
            }
            const paginator = {
                page: Number(req.query.page) || 1,
                filters: {
                    match: match
                },
            }
            let data;
            if (req.query.id) {

                data = await this._userRepository.findOne({
                    _id: req.query.id,
                    createdBy: user._id,
                    role: userTypes.ADMIN
                })

                if (!data) {
                    throw new BadRequestError('Invalid id!')
                }
            } else {
                data = await this._userRepository.getAll(paginator)
            }

            return response.postDataResponse(data);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    updateAdmin = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let body = _.pick(req.body, ["email", "name", "status", "password","avatar"]);
            let id = req.params.id;

            let admin = await this._userRepository.findOne({
                _id: id,
                createdBy: user._id,
                role: userTypes.ADMIN
            })

            if (!admin) {
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
                body.password = hashedPassword
            }

            let data = await this._userRepository.findAndUpdate(
                {
                    query: {
                        _id: id,
                        user: user._id,
                        role: userTypes.ADMIN
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

    removeAdmin = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._userRepository.setDBSession(session)
        try {
            let id = req.params.id;

            let admin = await this._userRepository.findOne({
                _id: id,
                user: user._id,
                role: userTypes.ADMIN
            })
            if (!admin) {
                throw new BadRequestError('Invalid id')
            }

            await this._userRepository.findAndDelete(
                {
                    query: {
                        _id: id,
                        user: user._id,
                        role: userTypes.ADMIN
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

module.exports = new AdminController()