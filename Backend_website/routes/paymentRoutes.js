const express = require('express');

const paymentController = require('../controllers/paymentController');

const passport = require('passport');

const authorize = require('../middlewares/authorize');



const router = express.Router();



router.post('/create-checkout-session', paymentController.createCheckoutSession);

router.post('/create-customer',paymentController.createCustomer);

router.post('/stripewebhook', paymentController.handleStripeWebhook);

router.get('/session-details',  paymentController.handleSessionDetails);

//router.get('/paid-products',  paymentController.fetchAllPayments);

router.get('/user-coursesubscription', paymentController.fetchUserPayments);




module.exports = router;