const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const createCourse = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log request body

    const course = new Course(req.body);
    const savedCourse = await course.save();

    res.status(httpStatus.CREATED).json(savedCourse); // Use httpStatus
  } catch (error) {
    console.error('Error creating course:', error); // Log error
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ // Use httpStatus
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR, // Use httpStatus
      message: error.message
    });
  }
};

const getCourses = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
  const filter = req.query.category ? { categories: req.query.category } : {};

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy]: order === 'desc' ? -1 : 1 },
    lean: true,
  };

  const result = await Course.paginate(filter, options);

  res.status(httpStatus.OK).json({ // Use httpStatus
    Courses: result.docs,
    totalPages: result.totalPages,
    currentPage: result.page,
    totalCourses: result.totalDocs,
  });
};

const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('tutor', 'name');
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found'); // Use httpStatus
  }
  res.status(httpStatus.OK).json(course); // Use httpStatus
};

const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found'); // Use httpStatus
  }
  res.status(httpStatus.OK).json(course); // Use httpStatus
};

const deleteCourse = async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found'); // Use httpStatus
  }
  res.status(httpStatus.NO_CONTENT).json({ message: 'Course deleted successfully' }); // Use httpStatus
};

const getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('categories');
    res.status(httpStatus.OK).json(categories); // Use httpStatus
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ // Use httpStatus
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR, // Use httpStatus
      message: error.message
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCategories // Ensure this is correctly exported
};
