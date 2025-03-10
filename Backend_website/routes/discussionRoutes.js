const express = require('express');
const passport = require('passport');
const authorize = require('../middlewares/authorize');
const discussionController = require('../controllers/discussionController');
const imageuploadController = require('../controllers/imageuploadController');
const messageRoutes = require('./messageRoutes'); // Import message routes

const router = express.Router();

router.post('/', passport.authenticate('jwt', { session: false }), discussionController.createDiscussion);
router.get('/', discussionController.getDiscussions);
router.post('/imageupload',imageuploadController.imageupload);
router.get('/protected',
    passport.authenticate('jwt', { session: false }),
    discussionController.getDiscussions);
router.get('/members',
    passport.authenticate('jwt', { session: false }),
    authorize(['member']),
    discussionController.getDiscussions);
router.get('/:id', discussionController.getDiscussion);
router.put('/:id', discussionController.updateDiscussion);
router.delete('/:id', discussionController.deleteDiscussion);

router.use('/messages', messageRoutes); // Use message routes

module.exports = router;

