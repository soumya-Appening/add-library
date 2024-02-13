require('dotenv').config();
const AWS = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3');

const config = {
    region: 'me-central-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

AWS.config.update(config);
  
const s3Url = new AWS.S3();
const s3 = new S3Client(config) 

module.exports = {
    s3Url,
    s3
};