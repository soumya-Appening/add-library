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

class PlatformController extends BaseController {
    constructor() {
        super()
    }

    addPLatform = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._platformRepository.setDBSession(session)
        try {
            let {
                name,
                url
            } = _.pick(req.body, ["name", "url"]);

            let isPlatformExist = await this._platformRepository.findOne(
                {
                    $or: [
                        { name: name },
                        { url: url }
                    ]
                }
            )

            if(isPlatformExist){
                throw new BadRequestError("Already exist")
            }

            const body = {
                name,
                url,
                createdBy: user._id
            }

            let platform = await this._platformRepository.createOrUpdateById(null, body)

            return response.postDataResponse(platform);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getPlatforms = async (req, res) => {
        const response = new AdminResponse(req, res);
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
            const paginator = {
                page: Number(req.query.page) || 1,
                filters: {
                    match: match
                },
                limit: 50
            }
            let product = await this._platformRepository.getAll(paginator)

            return response.postDataResponse(product);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

}

module.exports = new PlatformController()