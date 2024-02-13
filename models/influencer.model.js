/* Third Party Libraries */
const path = require('path');
/* Third Party Libraries */

/* Local Files */
const mongoose = require('mongoose');
const { profileActivity } = require('../helpers/constants');
const Schema = mongoose.Schema;
/* Local Files */

let InfluencerModel = new Schema({
    name: {
        type: String,
        default: null
    },
    snapchat_username:{
        type: String,
        default: null
    },
    insta_username:{
        type: String,
        default: null
    },
    uploader:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status:{
        type: Number,
        enum: Object.values(profileActivity),
        default: profileActivity.ACTIVE
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Influencer", InfluencerModel);
