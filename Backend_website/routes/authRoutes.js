const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Implement logout logic here
  res.json({ message: 'Logged out successfully' });
});
router.get('/profile', passport.authenticate('jwt', { session: false }), userController.getProfile);
router.put('/profile', passport.authenticate('jwt', { session: false }), userController.updateProfile);
router.get('/users', userController.getUserByEmail);
router.get('/byPost/:postId',userController.getUserByPostId);

module.exports = router;
