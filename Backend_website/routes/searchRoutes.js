const express = require('express');
const router = express.Router();
const { searchContent } = require('../controllers/searchController');
const passport = require('passport');
const authorize = require('../middlewares/authorize');

// Define the search route
router.get('/search', searchContent);

module.exports = router;
