/* Third Party Libraries */
const path = require('path');
const jwt = require('jsonwebtoken')
/* Third Party Libraries */

/* Local Files */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { userTypes,profileActivity } = require('../helpers/constants');
/* Local Files */

let UserModel = new Schema({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    role:{
        type: Number,
        enum: Object.values(userTypes),
    },
    status:{
        type: Number,
        enum: Object.values(profileActivity),
        default: profileActivity.ACTIVE
    },
    otp: {
        type: String,
        default: null
    },
    otpGeneratedAt: {
        type: Date,
        default: new Date().toISOString()
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    avatar:{
        type: String,
        default: null
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

const secret = process.env.JWT_SECRET

console.log(secret)

UserModel.methods.generateToken = function () {
    let user = this;
    const access = "auth";
    const token = jwt.sign({
        _id: user._id.toHexString(),
        access,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), /// 30 Days
    }, secret).toString();

    user.tokens.push({
        access,
        token
    });

    return user.save().then(() => {
        return user;
    });
};

UserModel.statics.findByToken = function (token) {
    const user = this;
    // try {
    const decoded = jwt.verify(token, secret);
    return user.findOne({
        "_id": decoded._id,
        "tokens.token": token,
    });
    // } catch (e) {
    //     console.log(e)
    //     throw new Error(e);
    //     // return Promise.reject(e);
    // }
};

module.exports = mongoose.model("User", UserModel);
