const express = require('express');
const postRoutes = require('./postRoutes');
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const productRoutes = require('./productRoutes');
const paymentRoutes = require('./paymentRoutes');
const discussionRoutes = require('./discussionRoutes');
const messageRoutes = require('./messageRoutes');
const searchRoutes = require('./searchRoutes');


const router = express.Router();

router.use('/posts', postRoutes);
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/products', productRoutes);
router.use('/payments', paymentRoutes);
router.use('/discussions', discussionRoutes);
router.use('/messages', messageRoutes);
router.use('/search', searchRoutes);

module.exports = router;
