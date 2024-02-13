/* Third Party Libraries */
const path = require('path');
/* Third Party Libraries */

/* Local Files */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/* Local Files */

let SupervisorUploaderModel = new Schema({
    superVisorId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    uploaders:[{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }],
}, {
    timestamps: true
})

module.exports = mongoose.model("SupervisorUploader", SupervisorUploaderModel);
