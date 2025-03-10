const Discussion = require('../models/Discussion');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const createDiscussion = async (req, res) => {
  try {
    console.log('Authenticated user:', req.user); // Log authenticated user

    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    console.log('Received discussion data:', req.body); // Log received data

    const discussion = new Discussion({
      ...req.body,
      host: req.user._id, // Use user ID as the host
    });

    const savedDiscussion = await discussion.save();
    console.log('Discussion saved:', savedDiscussion); // Log saved discussion
    res.status(201).json(savedDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message,
    });
  }
};

const getDiscussions = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Validate pagination parameters
  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid pagination parameters');
  }

  // Validate sorting parameters
  const allowedSortFields = ['createdAt', 'topic']; // Add or remove fields as needed
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

  const result = await Discussion.paginate({}, options);

  if (result.docs.length === 0 && page > 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No discussions found for this page');
  }

  res.json({
    discussions: result.docs,
    totalDiscussions: result.totalDocs,
    currentPage: result.page,
    totalPages: result.totalPages,
  });
};


const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate('host', 'name userIcon');
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};






const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!discussion) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Discussion not found');
    }
    res.json(discussion);
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndDelete(req.params.id);
    if (!discussion) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Discussion not found');
    }
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

module.exports = {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  updateDiscussion,
  deleteDiscussion
};
