
const _ = require('lodash');
const moment = require('moment')
const BadRequestError = require('../exceptions/badRequest.exception');
const BaseRepository = require('./_base.repository');
const { userTypes } = require('../helpers/constants');
const LeadModel = require('../models/lead.model');

module.exports = class LeadRepository extends BaseRepository {
    constructor() {
        super()
    }

    async findOne(query, select = null) {
        return LeadModel.findOne(query).select(select);
    }

    async createOrUpdateById(id, body){
        if(id){
            return LeadModel.findByIdAndUpdate(id, {...body}, {new: true}).session(this._session)
        }else{
            return (await new LeadModel(body).save({session: this._session}))
        }
    }

    async getAll(paginator) {
        const pipeline = [];
        return this.paginate({
            model: LeadModel,
            aggregation: pipeline,
            pageNumber: paginator.page,
            sort: paginator.sort,
            pageSize: paginator.limit || 20,
            filters: paginator.filters,
            lookup: paginator.lookup || [],
            addFields: paginator.addFields || null,
            project: paginator.project || null
        })

    }

}
