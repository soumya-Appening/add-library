
const _ = require('lodash');
const moment = require('moment')
const BadRequestError = require('../exceptions/badRequest.exception');
const BaseRepository = require('./_base.repository');
const { userTypes } = require('../helpers/constants');
const BrandModel = require('../models/brand.model');

module.exports = class BrandRepository extends BaseRepository {
    constructor() {
        super()
    }

    async findOne(query, select = null) {
        return BrandModel.findOne(query).select(select);
    }

    async findAll() {
        return BrandModel.find({});
    }

    async createOrUpdateById(id, body){
        if(id){
            return BrandModel.findByIdAndUpdate(id, {...body}, {new: true}).session(this._session)
        }else{
            return (await new BrandModel(body).save({session: this._session}))
        }
    }

    async getAll(paginator) {
        const pipeline = [];
        return this.paginate({
            model: BrandModel,
            aggregation: pipeline,
            pageNumber: paginator.page,
            pageSize: paginator.limit || 20,
            sort: paginator.sort,
            filters: paginator.filters,
            project: paginator.project || null
        })

    }

}
