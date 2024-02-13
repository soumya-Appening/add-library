/* Third Party Libraries */
const path = require('path');
/* Third Party Libraries */

/* Local Files */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/* Local Files */

let BrandModel = new Schema({
    name: {
        type: String,
        default: null
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Brand", BrandModel);
