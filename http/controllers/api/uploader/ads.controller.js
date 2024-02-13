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
/* End Responses */

class AdsController extends BaseController {
    constructor() {
        super()
    }

    getAds = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user
        console.log(user._id)

        try {
            let match = {
                uploaderId: user._id
            };
            let data;
            if (req.query.id) {
                match._id = req.query.id
                data = await this._adRepository.findOne(match)

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
                if (req.query.status) {
                    match['status'] = Number(req.query.status)
                }
                const paginator = {
                    page: Number(req.query.page) || 1,
                    filters: {
                        match: match
                    }
                }
                data = await this._adRepository.getAll(paginator)
            }

            return response.postDataResponse(data);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new AdsController()
