const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const createPost = async (req, res) => {
  try {
    const { title, content, categories, menberonly, is_featured, photos, slug } = req.body;
    const user_id = req.user._id; // Use authenticated user ID

    console.log('Creating post with user ID:', user_id);

    const newPost = new Post({
      title,
      content,
      categories,
      menberonly,
      is_featured,
      photos,
      slug,
      user_id,
    });

    const savedPost = await newPost.save();
    res.status(httpStatus.CREATED).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid pagination parameters');
    }

    const allowedSortFields = ['createdAt', 'title'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid sort field');
    }

    if (!['asc', 'desc'].includes(order.toLowerCase())) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid sort order');
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sortBy]: order === 'desc' ? -1 : 1 },
      lean: true,
    };

    const result = await Post.paginate({}, options);

    if (result.docs.length === 0 && page > 1) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No posts found for this page');
    }

    res.json({
      posts: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      totalPosts: result.totalDocs,
    });
  } catch (error) {
    console.error('Error fetching posts:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
    }
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  // getPostwithslug
};
