const { hashSync } = require("bcrypt");
const { UserRepository } = require("../../../../repositories");
const AdminResponse = require("../../../responses/admin.response");
const BaseController = require("../../_base.controller");
const bcrypt = require("bcrypt");

class SuperVisorNewController extends BaseController {
  constructor() {
    super();
  }

  addNewSupervisor = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    const user = req.user;
    this._userRepository.setDBSession(session);
    try {
      let { email, password, name } = _.pick(req.body, [
        "email",
        "password",
        "name",
        "avatar"
      ]);

      let saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      const body = {
        email,
        password: hashedPassword,
        name,
        user: user._id,
        role: userTypes.SUPERVISOR,
        createdBy: user._id
      };

      let admin = await this._userRepository.createOrUpdateById(null, body);

      return response.postDataResponse(admin);
    } catch (e) {
      return response.internalServerErrorResponse(e);
    }
  };

  getAllSupervisors = async (req, res) => {
    const response = new AdminResponse(req, res);
    const user = req.user;
    const session = req.dbSession;
    this._userRepository.setDBSession(session);

    try {
      await this._userRepository();
    } catch (error) {}
  };
}

module.exports = new SuperVisorNewController();
