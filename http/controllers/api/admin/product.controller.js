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

    addProduct = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._platformRepository.setDBSession(session)
        try {
            let {
                name,
                brandId
            } = _.pick(req.body, ["name","brandId"]);

            const body = {
                name,
                brand: brandId,
                createdBy: user._id
            }

            let product = await this._productRepository.createOrUpdateById(null, body)

            return response.postDataResponse(product);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }

    getProducts = async (req, res) => {
        const response = new AdminResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
            let match = {
                brand: req.query.brandId
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

}

module.exports = new BrandController()