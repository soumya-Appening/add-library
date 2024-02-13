
const _ = require('lodash');
const moment = require('moment')
const BadRequestError = require('../exceptions/badRequest.exception');
const BaseRepository = require('./_base.repository');
const { userTypes } = require('../helpers/constants');
const ProductModel = require('../models/product.model');

module.exports = class ProductRepository extends BaseRepository {
    constructor() {
        super()
    }

    async findOne(query, select = null) {
        return ProductModel.findOne(query).select(select);
    }

    async createOrUpdateById(id, body){
        if(id){
            return ProductModel.findByIdAndUpdate(id, {...body}, {new: true}).session(this._session)
        }else{
            return (await new ProductModel(body).save({session: this._session}))
        }
    }

    async getAll(paginator) {
        const pipeline = [];
        return this.paginate({
            model: ProductModel,
            aggregation: pipeline,
            pageNumber: paginator.page,
            pageSize: paginator.limit || 20,
            sort: paginator.sort,
            filters: paginator.filters,
            project: paginator.project || null
        })

    }

}
