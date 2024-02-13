const BaseResponse = require('./_base.response');

module.exports = class FileResponse extends BaseResponse {

    constructor(req, res) {
        super(req, res)
    }

    postDataResponse(data) {
        return this.okResponse(data);
    }
}