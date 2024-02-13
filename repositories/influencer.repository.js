
const _ = require('lodash');
const moment = require('moment')
const BadRequestError = require('../exceptions/badRequest.exception');
const BaseRepository = require('./_base.repository');
const { userTypes } = require('../helpers/constants');
const InfluencerModel = require('../models/influencer.model');

module.exports = class InfluencerRepository extends BaseRepository {
    constructor() {
        super()
    }

    async findOne(query, select = null) {
        return InfluencerModel.findOne(query).select(select);
    }

    async createOrUpdateById(id, body){
        if(id){
            return InfluencerModel.findByIdAndUpdate(id, {...body}, {new: true}).session(this._session)
        }else{
            return (await new InfluencerModel(body).save({session: this._session}))
        }
    }

    async getAll(paginator) {
        const pipeline = [];
        return this.paginate({
            model: InfluencerModel,
            aggregation: pipeline,
            pageNumber: paginator.page,
            sort: paginator.sort,
            pageSize: paginator.limit || 20,
            filters: paginator.filters,
            lookup: paginator.lookup || [],
            addFields: paginator.addFields || null,
            project: paginator.project || null,
            group: paginator.group || null
        })

    }

}
