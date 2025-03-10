const express = require('express');
const postController = require('../controllers/postController');
const imageuploadController = require('../controllers/imageuploadController');
const videouploadController = require('../controllers/videouploadController');
const passport = require('passport');
const authorize = require('../middlewares/authorize');

const router = express.Router();
router.post('/', passport.authenticate('jwt', { session: false }),postController.createPost);
router.get('/', postController.getPosts);
router.post('/imageupload',imageuploadController.imageupload);
//router.post('/fileupload',videouploadController.fileUpload);
router.get('/protected',
    passport.authenticate('jwt', { session: false }),
    postController.getPosts);
router.get('/members',
    passport.authenticate('jwt', { session: false }),
    authorize(['member']),
    postController.getPosts);
//router.get('/slug/:slug', postController.getPostwithslug);
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;
