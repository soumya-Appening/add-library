
const _ = require('lodash');
const moment = require('moment')
const BadRequestError = require('../exceptions/badRequest.exception');
const BaseRepository = require('./_base.repository');
const { userTypes } = require('../helpers/constants');
const UserModel = require('../models/user.model');

module.exports = class UserRepository extends BaseRepository {
  constructor() {
    super();
  }

  async findOne(query, select = null) {
    return UserModel.findOne(query).select(select);
  }

  async findAll(query) {
    return UserModel.find(query);
  }

  async findAndUpdate({ query, updateQuery, findType, select = null }) {
    if (findType === "email") {
      return UserModel.findOneAndUpdate({ email: query }, updateQuery, {
        new: true
      })
        .select(select)
        .session(this.session);
    } else {
      // if more fields are needed, add else if condition
      return UserModel.findByIdAndUpdate(query, updateQuery, { new: true })
        .select(select)
        .session(this.session);
    }
  }

  async createOrUpdateById(id, body) {
    if (id) {
      return UserModel.findByIdAndUpdate(
        id,
        { ...body },
        { new: true }
      ).session(this._session);
    } else {
      return (
        await new UserModel(body).save({ session: this._session })
      ).generateToken();
    }
  }

  async findAndDelete(query) {
    try {
      const deletedUser = await UserModel.findOneAndDelete(query);

      if (deletedUser) {
        return { success: true, deletedUser };
      } else {
        return {
          success: false,
          message: "User not found or already deleted"
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async aggregateModel({
    aggregation = [],
    filters = [],
    project = null,
    addFields = null,
    lookup = []
  }) {
    if (filters.hasOwnProperty("match")) {
      aggregation.unshift({
        $match: filters["match"]
      });
    }
    if (lookup.length > 0) {
      aggregation.push(...lookup);
    }

    if (addFields) {
      aggregation.push({
        $addFields: addFields
      });
    }

    if (project) {
      aggregation.push({
        $project: project
      });
    }

    const pipeline = [...aggregation];
    return UserModel.aggregate(pipeline);
  }

  async getAll(paginator) {
    const pipeline = [];
    return this.paginate({
      model: UserModel,
      aggregation: pipeline,
      pageNumber: paginator.page,
      sort: paginator.sort,
      filters: paginator.filters,
      lookup: paginator.lookup || [],
      addFields: paginator.addFields || null,
      project: paginator.project || null,
      pageSize: paginator.limit || 20
    });
  }
};
