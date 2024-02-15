const { hashSync } = require("bcrypt");
const { UserRepository } = require("../../../../repositories");
const AdminResponse = require("../../../responses/admin.response");
const BaseController = require("../../_base.controller");
const bcrypt = require("bcrypt");
const _ = require( "lodash" );
const { userTypes } = require( "../../../../helpers/constants" );

class UploaderNewController extends BaseController {
  constructor() {
    super();
  }

  addNewUploader = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    const { userId } = _.pick(req.params, ["userId"]);
    this._userRepository.setDBSession(session);

    try {
      const { name, email, password, supervisor } = _.pick(req.body, [
        "name",
        "email",
        "password",
        "supervisor"
      ]);

      const presentUser = await this._userRepository.findOne({ email });
      if (presentUser) throw new Error("User already exists!");

      const saltRound = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRound);

      const body = {
        name,
        email,
        supervisor,
        password: hashedPassword,
        user: userId,
        role: userTypes.UPLOADER,
        createdBy: userId
      };

      let uploader = await this._userRepository.createOrUpdateById(null, body);

      return response.postDataResponse(uploader);
    } catch (error) {
      return response.internalServerErrorResponse(error);
    }
  };

  // Inside UploaderNewController class

  getAllUploaders = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    let { userId } = _.pick(req.params, ["userId"]);
    this._userRepository.setDBSession(session);

    try {
      let uploaders = await this._userRepository.findAll({
        createdBy: userId,
        role: userTypes.UPLOADER
      });

      return response.postDataResponse(uploaders);
    } catch (e) {
      return response.internalServerErrorResponse(e); 
    }
  };

  deleteUploader = async (req, res) => {
    const response = new AdminResponse(req, res);
    const session = req.dbSession;
    let { userId, id } = _.pick(req.params, ["userId", "id"]);
    this._userRepository.setDBSession(session);

    try {
      let uploader = await this._userRepository.findOne({
        _id: id,
        createdBy: userId,
        role: userTypes.UPLOADER
      });

      if (!uploader) {
        throw new BadRequestError("No uploader found with this id");
      }

      await this._userRepository.findAndDelete({
        query: {
          _id: id,
          createdBy: userId,
          role: userTypes.UPLOADER
        }
      });

      return response.postDataResponse("Uploader removed successfully");
    } catch (e) {
      if (e instanceof BadRequestError) {
        return response.badRequestResponse(e);
      }
      return response.internalServerErrorResponse(e);
    }
  };
}

module.exports = new UploaderNewController();
