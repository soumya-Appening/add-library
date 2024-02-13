require('dotenv');
const { userTypes } = require('../../helpers/constants');
/* Helpers */
const Helper = require("../../helpers/helpers");
/* End Helpers*/

/* Models */
const UserModel = require('../../models/user.model');
/* End Models*/

/* Responses */
const ValidationResponse = require('../responses/validation.response');
/* End Response */

class ApiMiddleware {

    async auth(req, res, next) {
        const response = new ValidationResponse(req, res);
        try {
            const token = req.header("authorization").split(' ')[1];
            const user = await UserModel.findByToken(token);
            if (!user) {
                throw new Error("unauthorized");
            }
            req.user = user;
            next();
        } catch (e) {
            console.log(e, 'IN API auth middleware')
            return response.middlewareError("Unauthorized")
        }
    }
    async uploaderAuth(req, res, next) {
        const response = new ValidationResponse(req, res);
        try {
            const token = req.header("authorization").split(' ')[1];
            const user = await UserModel.findByToken(token);
            if (!user || user.role!= userTypes.UPLOADER) {
                throw new Error("unauthorized");
            }
            req.user = user;
            next();
        } catch (e) {
            console.log(e, 'IN API auth middleware')
            return response.middlewareError("Unauthorized")
        }
    }
    async adminAuth(req, res, next) {
        const response = new ValidationResponse(req, res);
        try {
            const token = req.header("authorization").split(' ')[1];
            const user = await UserModel.findByToken(token);
            if (!user || user.role!= userTypes.ADMIN) {
                throw new Error("unauthorized");
            }
            req.user = user;
            next();
        } catch (e) {
            console.log(e, 'IN API auth middleware')
            return response.middlewareError("Unauthorized")
        }
    }

    async superVisorAuth(req, res, next) {
        const response = new ValidationResponse(req, res);
        try {
            const token = req.header("authorization").split(' ')[1];
            const user = await UserModel.findByToken(token);
            if (!user || (user.role !== userTypes.ADMIN && user.role !== userTypes.SUPERVISOR)) {
                throw new Error("Unauthorized");
            }            
            req.user = user;
            next();
        } catch (e) {
            console.log(e, 'IN API auth middleware')
            return response.middlewareError("Unauthorized")
        }
    }

}

module.exports = new ApiMiddleware();