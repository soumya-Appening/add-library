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
const DashBoardResponse = require('../../../responses/dashboard.response');
const { userTypes, adStatus } = require('../../../../helpers/constants');
const BadRequestError = require('../../../../exceptions/badRequest.exception');
/* End Responses */

class DashboardController extends BaseController {
    constructor() {
        super()
    }

    getAds = async (req, res) => {
        const response = new DashBoardResponse(req, res);
        const session = req.dbSession
        const user = req.user

        try {
            let {
                influencers, brands, products, platform, fromDate, toDate
            } = req.query

            fromDate = fromDate ? new Date(fromDate) : null;
            toDate = toDate ? new Date(toDate) : null;
            let data;

            let match = {
                ...(influencers && { influencerId: { $in: influencers } }),
                ...(brands && { brandId: { $in: brands } }),
                ...(products && { productId: { $in: products } }),
                ...(platform && { platformId: { $in: platform } }),
                ...(fromDate && toDate && { date: { $gte: fromDate, $lte: toDate } }),
            }

            if(user.role === userTypes.SUPERVISOR){
                match['superVisorId'] = user._id;
            }

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
                        },
                        {
                            brandName: {
                                $regex: req.query.search,
                                $options: 'i'
                            }
                        },
                        {
                            productName: {
                                $regex: req.query.search,
                                $options: 'i'
                            }
                        },
                        {
                            influencerName: {
                                $regex: req.query.search,
                                $options: 'i'
                            }
                        }


                    ]
                }
                if (req.query.status) {
                    match['status'] = {
                        status: req.query.status
                    }
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

    getInfluencers = async (req, res) => {
        const response = new DashBoardResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._influencerRepository.setDBSession(session)
        try {
            let match = {
                createdBy: user._id
            };

            let data;
            const paginator = {
                page: Number(req.query.page) || 1,

            }
            if (req.query.id) {
                match._id = req.query.id
                data = await this._influencerRepository.findOne(match)

                if (!data) {
                    throw new Error('Invalid id!')
                }
            }
            else{
                let isShowAds = false;
                let lookup1 = [{
                    $lookup: {
                        from: 'adsvideos',
                        let: { influencerId: "$_id", 
                        brandId: ObjectId(req.query.brandId) || null,
                        supervisorId: ObjectId(user._id)
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$influencerId", "$$influencerId"] }
                                            ]
                                    }
                                }
                            },
                            {
                                $project:{
                                    _id:1,
                                    productName:1,
                                    platformName:1,
                                    brandName:1,
                                    influencerName:1,
                                    date:1,
                                    fileName:1
                                }
                            }
                        ],
                        as: 'influencerAds',
                    }
                },
            ]
                if(user.role === userTypes.SUPERVISOR){
                    lookup1[0]['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({ $eq: ["$supervisorId", "$$supervisorId"] })
                    isShowAds = true
                }
                if(req.query.brandId){
                    lookup1[0]['$lookup']['pipeline'][0]['$match']['$expr']['$and'].push({ $eq: ["$brandId", "$$brandId"] })
                    isShowAds = true
                }
                if(isShowAds){
                    lookup1.push({
                        $match: {
                            'influencerAds': { $exists: true, $ne: [] }
                        }
                    })
                }
                
                paginator['lookup'] = lookup1;
            }
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
            

            paginator['filter'] = {
                match: match
            }
            data = await this._influencerRepository.getAll(paginator)

            return response.postDataResponse(data);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    mapToObjectId = (arr) => {
        return arr.map(item => db.Types.ObjectId(item));
    }

    getInfluencerDetails = async (req, res) => {
        const response = new DashBoardResponse(req, res);
        const session = req.dbSession
        const user = req.user
        this._influencerRepository.setDBSession(session)
        try {

            let {
                brands, products, platform, fromDate, toDate
            } = req.query

            let match = {
                influencerId: db.Types.ObjectId(req.params.id),
                ...(brands && { brandId: { $in: this.mapToObjectId(brands) } }),
                ...(products && { productId: { $in: this.mapToObjectId(products) } }),
                ...(platform && { platformId: { $in: this.mapToObjectId(platform) } }),
                ...(fromDate && toDate && { date: { $gte: new Date(fromDate), $lte: new Date(toDate) } })
            }
            if(user.role === userTypes.SUPERVISOR){
                match['supervisorId'] = user._id;
            }
            if (req.query.search) {
                match['$or'] = [
                    {
                        productName: {
                            $regex: req.query.search,
                            $options: 'i'
                        }
                    },
                    {
                        brandName: {
                            $regex: req.query.search,
                            $options: 'i'
                        },
                    },
                    {
                        platformName: {
                            $regex: req.query.search,
                            $options: 'i'
                        }
                    }
                ]
            }

            let lookup = [
                {
                    $lookup: {
                        from: 'influencers',
                        let: { influencerId: "$influencerId" },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$_id", "$$influencerId"] },
                                            ]
                                    }
                                }
                            }
                        ],
                        as: 'influencerData',
                    }
                },
                {
                    $unwind: '$influencerData'
                }
            ]

            const paginator = {
                page: req.query.page || 1,
                filters: {
                    match: match
                },
                lookup
            }

            let data = await this._adRepository.getAll(paginator)

            let match2 = {
                influencerId: db.Types.ObjectId(req.params.id)
            }
            if(user.role === userTypes.SUPERVISOR){
                match2['supervisorId'] = user._id;
            }

            let group = [
                {
                    $group: {
                        _id: { brand: "$brandId", product: "$productId" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'brands',
                        localField: '_id.brand',
                        foreignField: '_id',
                        as: 'brandData'    
                    }
                },
                {
                    $unwind: '$brandData'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id.product',
                        foreignField: '_id',
                        as: 'productData'
                    }
                },
                {
                    $unwind: '$productData'
                },
                {
                    $group: {
                        _id: "$_id.brand",
                        brandName: { $first: "$brandData.name" },
                        products: {
                            $push: {
                                product: "$_id.product",
                                productName: "$productData.name",
                                count: "$count"
                            }
                        }
                    }
                }
            ]

            let project = {
                brand: "$_id",
                brandName: 1,
                products: 1,
                _id: 0
            }

            let brandData = await this._adRepository.aggregateModel({
                page: 1,
                filters: {
                    match: match2
                },
                group,
                project
            })
            data = {
                ...data,
                brandData
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

module.exports = new DashboardController()