const BaseResponse = require('./_base.response');

module.exports = class UploaderResponse extends BaseResponse {

    constructor(req, res) {
        super(req, res)
    }

    postDataResponse(data) {
        return this.okResponse(data);
    }
}