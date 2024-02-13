require('dotenv').config();
const { s3, s3Url } = require('./s3.config');
const multerS3 = require('multer-s3');
const multer = require("multer")
const path = require('path');

const bucketName = process.env.AWS_BUCKET;

const s3Storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    metadata: function (req, file, cb) {
        cb(null, {
            fieldName: file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        });
    },
    key: async function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB upload limit
        // files: 1                    // 1 file
    },
    fileFilter: (req, file, cb) => {
        // if the file extension is in our accepted list
        if (mimeTypes.allowed_image_mimes.some(ext => file.originalname.endsWith("." + ext))) {
            return cb(null, true);
        }
        // otherwise, return error
        return cb(new Error('file not allowed'));
    },
    // storage: storage//storage
    storage: s3Storage //s3
});

const mimeTypes = {
    'allowed_image_mimes': ['jpeg', 'png', 'bmp', 'jpg', 'apk', 'svg']
};

class FileUpload {
    constructor() {
        this.files = this.files.bind(this);
    }
    files(filesArray) {
        try {
            const images = []
            let files = filesArray.map(file => {
                return {
                    name: file
                }
            });
            const uploadable = upload.fields(files)
            return (req, res, next) => {
                uploadable(req, res, function (err) {
                    console.log(err, 'Error in fileUpload')
                    req.uploadError = err
                    if (err) {
                        next(err)
                        return
                    }
                    next()
                })
            };

        } catch (e) {
            console.log(e, 'Error at fileUploads')
            return e
        }
    }
    getPresignUrlPromiseFunction(fileName) {
        return new Promise(async (resolve, reject) => {
            try {
                s3Url.getSignedUrl('putObject', {
                    Bucket: bucketName,
                    Key: fileName,
                    Expires: 3600,
                    ContentType: 'video/*'
                }, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }


}

module.exports = new FileUpload();
