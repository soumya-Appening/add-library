
const _ = require('lodash');
const moment = require('moment')
const BadRequestError = require('../exceptions/badRequest.exception');
const BaseRepository = require('./_base.repository');
const { userTypes } = require('../helpers/constants');
const SupervisorModel = require('../models/supervisorUploader.model');

module.exports = class SuperVisorUploaderRepository extends BaseRepository {
    constructor() {
        super()
    }

    async findOne(query, select = null,populate = null) {
        return SupervisorModel.findOne(query).select(select).populate(populate);
    }

    async findAll(query) {
        return SupervisorModel.find(query);
    }

    async findAndUpdate(query,body){
        return SupervisorModel.findOneAndUpdate(query,{...body}, {new:true, upsert:true})
    }

    async createOrUpdateById(id, body){
        if(id){
            return SupervisorModel.findByIdAndUpdate(id, {...body}, {new: true}).session(this._session)
        }else{
            return (await new SupervisorModel(body).save({session: this._session}))
        }
    }
    

    async findAndDelete(query){
        return SupervisorModel.findOneAndDelete(query)
    }

    async getAll(paginator) {
        const pipeline = [];
        return this.paginate({
            model: SupervisorModel,
            aggregation: pipeline,
            pageNumber: paginator.page,
            sort: paginator.sort,
            filters: paginator.filters,
            lookup: paginator.lookup || [],
            addFields: paginator.addFields || null,
            project: paginator.project || null
        })

    }

}
