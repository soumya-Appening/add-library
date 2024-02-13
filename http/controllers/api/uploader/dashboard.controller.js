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

class DashBoardContoller extends BaseController {
    constructor() {
        super()
    }

    getTotalAds = async (req, res) => {
        const response = new UploaderResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
           let match = {
              _id: user._id
           }
            let lookup1 = {
                $lookup: {
                    from: 'adsvideos',
                    localField: '_id',
                    foreignField: 'uploaderId',
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

            let lookup2 = createLookupStage(adStatus.REJECT, 'rejectedAds');
            let lookup3 = createLookupStage(adStatus.ACCEPT, 'acceptedAds');
            let lookup4 = createLookupStage(adStatus.UPLOAD, 'pendingAds');

            let lookup = [lookup1, lookup2, lookup3, lookup4 ]

            let addFields = {
                totalAds: { $size: '$ads' },
                totalRejectedAds: { $size: '$rejectedAds' },
                totalAcceptedAds: { $size: '$acceptedAds' },
                totalPendingAds: { $size: '$pendingAds' }
            }

            let project = {
                "totalAds": 1,
                "totalRejectedAds": 1,
                "totalAcceptedAds": 1,
                "totalPendingAds": 1,
                _id: 0
            }

            const query = {
                filters: {
                    match: match
                },
                lookup,
                addFields,
                project
            }
            let data = await this._userRepository.aggregateModel(query)

            return response.postDataResponse(data[0]);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new DashBoardContoller()
