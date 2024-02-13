/* Third Party Libraries */
const path = require('path');
/* Third Party Libraries */

/* Local Files */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { adStatus, videoStatus } = require('../helpers/constants');
/* Local Files */

let AdsVideoModel = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    productName: {
        type: String,
        default: null
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        default: null
    },
    brandName: {
        type: String,
        default: null
    },
    platformId: {
        type: Schema.Types.ObjectId,
        ref: 'Platform',
        default: null
    },
    platformName: {
        type: String,
        default: null
    },
    uploaderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    uploaderName: {
        type: String,
        default: null
    },
    supervisorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    supervisorName: {
        type: String,
        default: null
    },
    influencerId: {
        type: Schema.Types.ObjectId,
        ref: 'Influencer',
        default: null
    },
    influencerName: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: new Date()
    },
    status: {
        type: Number,
        enum: Object.values(adStatus),
        default: adStatus.UPLOAD
    },
    videoStatus:{
        type: Number,
        enum: Object.values(videoStatus),
        default: videoStatus.PENDING
    },
    rejectedReason:{
       type: String,
       default:null
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("AdsVideo", AdsVideoModel);
