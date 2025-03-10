const express = require('express');
const courseController = require('../controllers/courseController');
const imageuploadController = require('../controllers/imageuploadController');
const passport = require('passport');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.post('/courses', courseController.createCourse);
router.get('/courses', courseController.getCourses);
router.post('/imageupload',imageuploadController.imageupload);
router.get('/courses/protected',
  passport.authenticate('jwt', { session: false }),
  courseController.getCourses
);
router.get('/courses/protectedadmin',
  passport.authenticate('jwt', { session: false }),
  authorize(['admin']),
  courseController.getCourses
);
router.get('/courses/:id', courseController.getCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.get('/categories', courseController.getCategories);

module.exports = router;
