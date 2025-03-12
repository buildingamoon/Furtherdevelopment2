const express = require('express');
const courseController = require('../controllers/courseController');
const imageuploadController = require('../controllers/imageuploadController');
const passport = require('passport');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Course approval system routes must come BEFORE /:id routes to avoid being treated as IDs
router.get('/pending-courses', 
  passport.authenticate('jwt', { session: false }), 
  authorize(['admin']), 
  courseController.getPendingCourses
);

// Course creation and management
router.post('/', 
  passport.authenticate('jwt', { session: false }), 
  courseController.createCourse
);

router.get('/', courseController.getCourses);

router.get('/my-courses', 
  passport.authenticate('jwt', { session: false }), 
  courseController.getMyCourses
);

router.get('/categories', courseController.getCategories);

// These routes must come after the specific routes
router.get('/:id', courseController.getCourse);

router.put('/:id/approve', 
  passport.authenticate('jwt', { session: false }), 
  authorize(['admin']), 
  courseController.approveCourse
);

router.put('/:id/disapprove', 
  passport.authenticate('jwt', { session: false }), 
  authorize(['admin']), 
  courseController.disapproveCourse
);

router.put('/:id', 
  passport.authenticate('jwt', { session: false }), 
  courseController.updateCourse
);

router.delete('/:id', 
  passport.authenticate('jwt', { session: false }), 
  courseController.deleteCourse
);

// Utility routes
router.post('/imageupload', imageuploadController.imageupload);

module.exports = router;