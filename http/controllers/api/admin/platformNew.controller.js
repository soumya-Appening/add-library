const { hashSync } = require("bcrypt");
const { UserRepository } = require("../../../../repositories");
const AdminResponse = require("../../../responses/admin.response");
const BaseController = require("../../_base.controller");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { userTypes } = require("../../../../helpers/constants");
const BadRequestError = require("../../../../exceptions/badRequest.exception");

class PlatformNewController extends BaseController {
  constructor() {
    super();
    this._userRepository = new UserRepository();
  }

  addNewPlatform = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    const { userId } = _.pick(req.params, ["userId"]);
    this._platformRepository.setDBSession(session);
    try {
      let { name, url } = _.pick(req.body, ["name", "url"]);

      let isPlatformExist = await this._platformRepository.findOne({
        $or: [{ name }, { url }]
      });

      if (isPlatformExist) {
        throw new BadRequestError("Already exist");
      }

      const body = {
        name,
        url,
        createdBy: userId
      };

      let platform = await this._platformRepository.createOrUpdateById(
        null,
        body
      );

      return response.postDataResponse(platform);
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };

  getAllPlatform = async (req, res) => {
    const response = new AdminResponse(req, res);

    try {
      let match = {};
      if (req.query.search) {
        match["$or"] = [
          {
            name: {
              $regex: req.query.search,
              $options: "i"
            }
          }
        ];
      }
      const paginator = {
        page: Number(req.query.page) || 1,
        filters: {
          match: match
        },
        limit: 50
      };
      let product = await this._platformRepository.getAll(paginator);

      return response.postDataResponse(product);
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };

  deleteAPlatform = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    let { userId, id } = _.pick(req.params, ["userId", "id"]);
    this._platformRepository.setDBSession(session);

    try {
      let platform = await this._platformRepository.findOne({
        _id: id,
        createdBy: userId
      });

      if (!platform) {
        throw new BadRequestError("No platform found with this id");
      }

      const deletionResult = await this._platformRepository.findAndDelete({
        _id: id,
        createdBy: userId
      });

      if (deletionResult.success) {
        return response.postDataResponse("Platform removed successfully");
      } else {
        throw new BadRequestError(deletionResult.message);
      }
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };
}

module.exports = new PlatformNewController();
