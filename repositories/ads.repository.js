
const _ = require('lodash');
const moment = require('moment')
const BadRequestError = require('../exceptions/badRequest.exception');
const BaseRepository = require('./_base.repository');
const { userTypes } = require('../helpers/constants');
const AdsModel = require('../models/ads.model');

module.exports = class AdRepository extends BaseRepository {
    constructor() {
        super()
    }

    async findOne(query, select = null) {
        return AdsModel.findOne(query).select(select);
    }

    async createOrUpdateById(id, body){
        if(id){
            return AdsModel.findByIdAndUpdate(id, {...body}, {new: true}).session(this._session)
        }else{
            return (await new AdsModel(body).save({session: this._session}))
        }
    }

    async aggregateModel({
        aggregation = [],
        filters = [],
        project = null,
        addFields = null,
        lookup = [],
        group = [],
        facet = null
    }) {

        if (filters.hasOwnProperty('match')) {
            aggregation.unshift({
                $match: filters['match']
            })
        }
        if (lookup.length > 0) {
            aggregation.push(...lookup)
        }

        if (addFields) {
            aggregation.push({
                $addFields: addFields
            })
        }

        if(group.length > 0){
            aggregation.push(...group)
        }

        if(facet){
            aggregation.push(facet)
        }

        if (project) {
            aggregation.push({
                $project: project
            })
        }

        const pipeline = [
            ...aggregation,
        ];
        return AdsModel.aggregate(pipeline);

    };

    async getAll(paginator) {
        const pipeline = [];
        return this.paginate({
            model: AdsModel,
            aggregation: pipeline,
            pageNumber: paginator.page,
            sort: paginator.sort,
            pageSize: paginator.limit || 20,
            filters: paginator.filters,
            lookup: paginator.lookup || [],
            addFields: paginator.addFields || null,
            project: paginator.project || null,
            group: paginator.group || []
        })

    }

}
