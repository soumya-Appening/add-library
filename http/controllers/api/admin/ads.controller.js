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
const AdsResponse = require('../../../responses/ads.response');
const { userTypes, adStatus } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
/* End Responses */

class AdsController extends BaseController {
    constructor() {
        super()
    }

    updateAds = async (req, res) => {
        const response = new AdsResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._adRepository.setDBSession(session)
        this._productRepository.setDBSession(session)
        this._brandRepository.setDBSession(session)
        this._influencerRepository.setDBSession(session)
        this._platformRepository.setDBSession(session)
        this._userRepository.setDBSession(session)

        try {
            let body = _.pick(req.body, [ 'platformId', 'influencerId', 'brandId', 'productId',
                'date', 'status', 'rejectedReason'])
            let id = req.params.id
            let ad = await this._adRepository.findOne({ _id: id });
            if (!ad) {
                throw new BadRequestError('Invalid ad')
            }
            if (body.status === adStatus.REJECT) {
                if (!body.rejectedReason) {
                    throw new BadRequestError('Please select reject reason')
                }
            }

            if (body.brandId && body.productId) {
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
            }

            if (body.platformId) {
                let platform = await this._platformRepository.findOne({ _id: body.platformId }, 'name');
                if (!platform) {
                    throw new BadRequestError('Invalid platform')
                }
            }

            if (body.influencerId) {
                let influencer = await this._influencerRepository.findOne({
                    _id: body.influencerId
                }, 'name');
                if (!influencer) {
                    throw new BadRequestError('Invalid influencer')
                }
            }

            let updatedAds = await this._adRepository.createOrUpdateById(id, body)
            return response.postDataResponse(updatedAds);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new AdsController()