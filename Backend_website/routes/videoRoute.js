const express = require('express');
const passport = require('passport');
const authorize = require('../middlewares/authorize');
const videouploadController = require('../controllers/videouploadController');


const router = express.Router();


router.post('/fileupload',videouploadController.videoUpload);


module.exports = router;