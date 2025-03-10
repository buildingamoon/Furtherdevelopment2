const express = require('express');
const productController = require('../controllers/productController');
const passport = require('passport');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
//router.get('/slug/:slug', postController.getPostwithslug);
router.get('/:id', productController.getProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;