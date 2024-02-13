const BaseResponse = require('./_base.response');

module.exports = class UploaderProfileResponse extends BaseResponse {

    constructor(req, res) {
        super(req, res)
    }

    postDataResponse(data) {
        return this.okResponse(data);
    }
}