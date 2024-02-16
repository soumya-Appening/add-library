const { hashSync } = require("bcrypt");
const { UserRepository } = require("../../../../repositories");
const AdminResponse = require("../../../responses/admin.response");
const BaseController = require("../../_base.controller");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { userTypes } = require("../../../../helpers/constants");
const BadRequestError = require("../../../../exceptions/badRequest.exception");

class SuperVisorNewController extends BaseController {
  constructor() {
    super();
    this._userRepository = new UserRepository();
  }

  addNewSupervisor = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    console.log("Session: ", session);
    // const user = req.user;
    this._userRepository.setDBSession(session);
    try {
      let { userId } = _.pick(req.params, ["userId"]);

      let { email, password, name, avatar } = _.pick(req.body, [
        "email",
        "password",
        "name",
        "avatar"
      ]);
      console.log(email, password, name, avatar);

      let saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      console.log(hashedPassword);

      const body = {
        email,
        password: hashedPassword,
        name,
        user: userId,
        role: userTypes.SUPERVISOR,
        createdBy: userId
      };
      console.log("Body: ", body);

      let admin = await this._userRepository.createOrUpdateById(null, body);
      console.log("Admin: ", admin);

      return response.postDataResponse(admin);
    } catch (e) {
      return response.internalServerErrorResponse(e);
    }
  };

  getAllSupervisors = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    let { userId } = _.pick(req.params, ["userId"]);
    this._userRepository.setDBSession(session);

    try {
      // Set up paginator to retrieve all documents
      const paginator = {
        page: 1, // Start from page 1
        filters: { createdBy: userId, role: userTypes.SUPERVISOR }, // Your filter criteria
        lookup: [],
        addFields: null,
        project: null,
        limit: 0 // Set limit to 0 to fetch all documents
      };

      let supervisors = await this._userRepository.getAll(paginator);

      return response.postDataResponse(supervisors);
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };

  deleteASupervisor = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    let { userId, id } = _.pick(req.params, ["userId", "id"]);
    this._userRepository.setDBSession(session);
    try {
      let supervisor = await this._userRepository.findOne({
        _id: id,
        createdBy: userId,
        role: userTypes.SUPERVISOR
      });
      if (!supervisor) {
        throw new BadRequestError("No supervisor found with this id");
      }

      await this._userRepository.findAndDelete({
        query: {
          _id: id,
          createdBy: userId,
          role: userTypes.SUPERVISOR
        }
      });

      return response.postDataResponse("Supervisor removed successfully");
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };
}

module.exports = new SuperVisorNewController();
