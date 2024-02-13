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

class BrandController extends BaseController {
    constructor() {
        super()
    }

    addBrand = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._brandRepository.setDBSession(session)
        try {
            let {
                name
            } = _.pick(req.body, ["name"]);

            let isBrandExist = await this._brandRepository.findOne({
                name
            })
            
            if(isBrandExist){
                throw new BadRequestError("Already exist")
            }

            const body = {
                name,
                createdBy: user._id
            }

            let brand = await this._brandRepository.createOrUpdateById(null, body)

            return response.postDataResponse(brand);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getBrands = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        
        try {
            let match = {};
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
                limit: req.query.limit || 50,
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
}

module.exports = new BrandController()