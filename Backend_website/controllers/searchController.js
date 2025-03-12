const mongoose = require('mongoose');
const Post = require('../models/Post');
const Course = require('../models/Course');
const httpStatus = require('../utils/httpStatus');

const searchContent = async (req, res) => {
  try {
    const keyword = req.query.keyword?.toLowerCase() || '';
    if (!keyword) {
      return res.status(httpStatus.OK).json({ results: [] });
    }

    const [posts, courses] = await Promise.all([
      Post.find({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { content: { $regex: keyword, $options: 'i' } },
          { categories: { $regex: keyword, $options: 'i' } }
        ]
      }).populate('user_id').limit(10),
      Course.find({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { categories: { $regex: keyword, $options: 'i' } }
        ]
      }).populate('tutor').limit(10)
    ]);

    const results = [
      ...posts.map(post => ({ ...post.toObject(), type: 'post' })),
      ...courses.map(course => ({ ...course.toObject(), type: 'course' }))
    ];

    // Sort results by relevance
    results.sort((a, b) => {
      // Prioritize title matches
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aHasKeywordInTitle = aTitle.includes(keyword);
      const bHasKeywordInTitle = bTitle.includes(keyword);

      if (aHasKeywordInTitle && !bHasKeywordInTitle) return -1;
      if (!aHasKeywordInTitle && bHasKeywordInTitle) return 1;

      // Then sort by featured status
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      // Finally sort by date
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(httpStatus.OK).json({
      results: results.slice(0, 10),
      total: results.length,
      keyword: keyword
    });

  } catch (error) {
    console.error('Error in search:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};

module.exports = { searchContent };