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
const ChartResponse = require('../../../responses/chart.response');
const { userTypes, adStatus } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
/* End Responses */

class ChartController extends BaseController {
    constructor() {
        super();
    }

    _getChartData = async (req, uniqueMethod) => {
        try {
            const startDate = moment(req.query.fromDate).startOf('day');
            const endDate = moment(req.query.toDate).endOf('day');
            let chart = {
                chartLabels: [],
                chartData: [],
            };

            const dayDifference = endDate.diff(startDate, "days");

            for (let i = 0; i <= dayDifference; i++) {
                const newStartDate = moment(startDate)
                    .add(i, "days").startOf("day");
                const newEndDate = moment(startDate).add(i, "days").endOf("day");
                const totalAds = await this[uniqueMethod](
                    newStartDate,
                    newEndDate
                );

                if (totalAds.length == 0) {
                    totalAds.push({ _id: null, count: 0 })
                }

                chart["chartLabels"].push(moment(newEndDate, "YYYY-MM-DD"));
                chart["chartData"].push(totalAds);
            }

            return chart;
        } catch (error) {
            throw new Error(error);
        }
    }

    _getTotalAds = async (startDate, endDate) => {
        let match = {
            $or: [
                {
                    $and: [
                        { createdAt: { $gte: startDate.toDate() } },
                        { createdAt: { $lte: endDate.toDate() } },
                    ]
                }
            ]
        }
        let group = [
            {
                $group: { _id: null, count: { $sum: 1 } }
            }
        ]
        const ads = await this._adRepository.aggregateModel(
            {
                filters: {
                    match
                },
                group,
                project: {
                    count: {
                        $toInt: "$count"
                    }
                }
            }

        )
        return ads;
    }

    getAdsChart = async (req, res) => {
        const response = new ChartResponse(req, res);
        const session = req.dbSession;
        try {
            let { fromDate, toDate } = _.pick(req.query, ["fromDate", "toDate"]);
            fromDate = moment(fromDate).startOf('day').toDate();
            toDate = moment(toDate).endOf('day').toDate();
            console.log(fromDate)
            let match = {
                createdAt: {
                    $gte: fromDate,
                    $lte: toDate
                }
            }
            let addFields = {
                date: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                },
            }

            let facet = {
                $facet: {
                    totalAds: [
                        {
                            $group: {
                                _id: null,
                                totalAds: { $sum: 1 }
                            }
                        },
                        { $project: { _id: 0, totalAds: "$totalAds" } }
                    ],

                    adsDistribution: [
                        {
                            $group: {
                                _id: "$platformId",
                                count: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "platforms",
                                localField: "_id",
                                foreignField: "_id",
                                as: "platform"
                            }
                        },
                        {
                            $unwind: "$platform"
                        },
                        {
                            $project: {
                                platfromName: "$platform.name",
                                count: 1
                            }
                        }
                    ],
                    adsBrands: [
                        {
                            $group: {
                                _id: "$brandId",
                                count: {
                                    $sum: 1
                                }
                            },

                        },
                        {
                            $lookup: {
                                from: "brands",
                                localField: "_id",
                                foreignField: "_id",
                                as: "brand"
                            }
                        },
                        {
                            $unwind: "$brand"
                        },
                        {
                            $project: {
                                brandName: "$brand.name",
                                count: 1
                            }
                        }
                    ],
                    adsStatus: [{
                        $group: {
                            _id: null,
                            totalAcceptedAds: {
                                $sum: { $cond: [{ $eq: ['$status', adStatus.ACCEPT] }, 1, 0] }
                            },
                            totalPendingAds: {
                                $sum: { $cond: [{ $eq: ['$status', adStatus.UPLOAD] }, 1, 0] }
                            },
                            totalRejectedAds: {
                                $sum: { $cond: [{ $eq: ['$status', adStatus.REJECT] }, 1, 0] }
                            }
                        }
                    }],
                }
            }
            let ads = await this._adRepository.aggregateModel({
                filters: {
                    match
                },
                addFields,
                facet
            })

            let chart = await this._getChartData(req, "_getTotalAds");
            let data = {
                ...ads[0],
                chart
            }

            return response.postDataResponse(data);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }

    }

    getTopUsers = async (req, res) => {
        const response = new ChartResponse(req, res);
        const session = req.dbSession;
        try {
            let { fromDate, toDate } = _.pick(req.query, ["fromDate", "toDate"]);
            fromDate = moment(fromDate).startOf('day').toDate();
            toDate = moment(toDate).endOf('day').toDate();
            console.log(fromDate)
            let match = {
                createdAt: {
                    $gte: fromDate,
                    $lte: toDate
                }
            }
            let addFields = {
                date: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                },
            }
            let group = [

            ]
            let facet = {
                $facet: {
                    topInfluencer: [
                        {
                            $group: {
                                _id: "$influencerId",
                                totalAds: { $sum: 1 }
                            }
                        },
                        {
                            $sort: { totalAds: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $lookup: {
                                from: "influencers",
                                localField: "_id",
                                foreignField: "_id",
                                as: "influencer"
                            }
                        },
                        {
                            $unwind: "$influencer"
                        },
                        {
                            $project: {
                                influencerName: "$influencer.name",
                                totalAds: 1
                            }
                        }
                    ],
                    topUploader: [
                        {
                            $group: {
                                _id: "$uploaderId",
                                totalAds: { $sum: 1 }
                            }
                        },
                        {
                            $sort: { totalAds: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "uploader"
                            }
                        },
                        {
                            $unwind: "$uploader"
                        },
                        {
                            $project: {
                                uploaderName: "$uploader.name",
                                uploaderEmail: "$uploader.email",
                                totalAds: 1
                            }
                        }
                    ],
                    topSupervisor: [
                        {
                            $group: {
                                _id: "$supervisorId",
                                totalAds: { $sum: 1 }
                            }
                        },
                        {
                            $sort: { totalAds: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "supervisor"
                            }
                        },
                        {
                            $unwind: "$supervisor"
                        },
                        {
                            $project: {
                                supervisorName: "$supervisor.name",
                                supervisorEmail: "$supervisor.email",
                                totalAds: 1
                            }
                        }
                    ],
                }
            }
            let ads = await this._adRepository.aggregateModel({
                filters: {
                    match
                },
                addFields,
                facet
            })

            return response.postDataResponse(ads);
        } catch (e) {
            if (e instanceof BadRequestError) {
                return response.badRequestResponse(e)
            }
            return response.internalServerErrorResponse(e);
        }

    }
}

module.exports = new ChartController();
