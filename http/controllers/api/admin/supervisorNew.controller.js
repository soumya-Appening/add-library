const { hashSync } = require("bcrypt");
const { UserRepository } = require("../../../../repositories");
const AdminResponse = require("../../../responses/admin.response");
const BaseController = require("../../_base.controller");
const bcrypt = require("bcrypt");

class supervisorNewController extends BaseController {
  constructor() {
    super();
  }

  addNewSupervisor = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    const user = req.user;
    this._userRepository.setDBSession(session);
    try {
      const { name, email, password } = _.pick(req.body, [
        "name",
        "email",
        "password",
        "avatar",
      ]);

      const presentUser = await this._userRepository.find(email);
      if (presentUser) throw new Error("User already exists!");

      const saltRound = 10;
      const hashedPassword = await bcrypt.hashSync(password, saltRound);

      const body = {
        name,
        email,
        password: hashedPassword,
        user: user._id,
        role: userTypes.SUPERVISOR,
        createdBy: user._id,
      };

      let supervisor = await this._userRepository.createOrUpdateById(
        null,
        body
      );

      return response.postDataResponse(supervisor);
    } catch (error) {
      return response.internalServerErrorResponse(error);
    }
  };
}
