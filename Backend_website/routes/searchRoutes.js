const express = require('express');
const router = express.Router();
const { searchContent } = require('../controllers/searchController');

// Search route that handles both posts and courses
router.get('/', searchContent);

module.exports = router;