const config = require('../config/config');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const { StatusCodes } = require('http-status-codes'); // Use http-status-codes

// Configure AWS SDK
const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

const upload = multer({
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
      cb(null, 'images/' + uniqueSuffix + '-' + file.originalname);
    },
  }),
});

const imageupload = async (req, res) => {
  const singleUpload = upload.single('image');

  singleUpload(req, res, (err) => {
    if (err) {
      // Directly send the error response if multer throws an error
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Error uploading file: ${err.message}`,
      });
    }

    // If the file has been uploaded and multer-s3 has set the location, send success response
    if (req.file && req.file.location) {
      res.status(StatusCodes.OK).json({
        message: 'Image uploaded successfully',
        url: req.file.location,
      });
    } else {
      // If there is no file or location, respond with an error
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to upload image. No file was uploaded or no location is available.',
      });
    }
  });
};

module.exports = {
  imageupload,
};