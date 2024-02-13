/* Third Party Libraries */
const path = require('path');
const jwt = require('jsonwebtoken')
/* Third Party Libraries */

/* Local Files */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/* Local Files */

let LeadModel = new Schema({
    name: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    email:{
        type: String,
        default: null
    }
}, {
    timestamps: true
})


module.exports = mongoose.model("Lead", LeadModel);
