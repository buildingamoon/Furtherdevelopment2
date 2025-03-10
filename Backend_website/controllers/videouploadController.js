const config = require('../config/config');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const { StatusCodes } = require('http-status-codes');

// Configure AWS SDK
const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

const videoupload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: config.s3.bucket,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'videos/' + uniqueSuffix + '-' + file.originalname);
    },
  }),
});

const videoUpload = async (req, res) => {
  const singleUpload = videoUpload.single('video');

  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Error uploading video: ${err.message}`,
      });
    }

    if (req.file && req.file.location) {
      res.status(StatusCodes.OK).json({
        message: 'Video uploaded successfully',
        url: req.file.location,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to upload video. No file was uploaded or no location is available.',
      });
    }
  });
};

module.exports = {
  videoUpload,
};