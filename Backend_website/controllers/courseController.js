const Course = require('../models/Course');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');
const jwt = require('jsonwebtoken');

const createCourse = async (req, res) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: 'error',
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate required fields
    const requiredFields = ['title', 'categories', 'description', 'learningModes'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: 'error',
          message: `Missing required field: ${field}`
        });
      }
    }

    // Create course object with tutor ID from token
    const courseData = {
      ...req.body,
      tutor: decoded.userId,
      is_approved: false,
      disapprovalReason: null
    };

    // Convert price from dollars to cents if present
    if (courseData.Price) {
      courseData.Price = Math.round(courseData.Price * 100);
    }

    // Handle crowdfunding data if present
    if (courseData.isCrowdfunding) {
      if (!courseData.crowdfunding?.minStudents || !courseData.crowdfunding?.startDate || !courseData.crowdfunding?.startupFee) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Missing required crowdfunding fields'
        });
      }
    }

    // Create and save the course
    const course = new Course(courseData);
    const savedCourse = await course.save();

    // Populate tutor information
    const populatedCourse = await Course.findById(savedCourse._id)
      .populate('tutor', 'name userIcon');

    res.status(httpStatus.CREATED).json(populatedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to create course',
      details: error.message
    });
  }
};

const getMyCourses = async (req, res) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        status: 'error',
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const courses = await Course.find({ tutor: decoded.userId })
      .populate('tutor', 'name userIcon')
      .sort({ createdAt: -1 });
    
    res.status(httpStatus.OK).json(courses);
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to fetch courses'
    });
  }
};

const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ is_approved: false })
      .populate('tutor', 'name userIcon email')
      .sort({ createdAt: -1 });
    
    res.status(httpStatus.OK).json(courses);
  } catch (error) {
    console.error('Error fetching pending courses:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to fetch pending courses'
    });
  }
};

const approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { 
        is_approved: true,
        disapprovalReason: null 
      },
      { new: true }
    ).populate('tutor', 'name userIcon');

    if (!course) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    res.status(httpStatus.OK).json(course);
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to approve course'
    });
  }
};

const disapproveCourse = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Disapproval reason is required'
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { 
        is_approved: false,
        disapprovalReason: reason 
      },
      { new: true }
    ).populate('tutor', 'name userIcon');

    if (!course) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    res.status(httpStatus.OK).json(course);
  } catch (error) {
    console.error('Error disapproving course:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to disapprove course'
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      featured,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { is_approved: true };
    if (category) query.categories = category;
    if (featured) query.is_featured = featured === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      populate: {
        path: 'tutor',
        select: 'name userIcon'
      }
    };

    const result = await Course.paginate(query, options);

    res.status(httpStatus.OK).json({
      Courses: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      totalCourses: result.totalDocs
    });
  } catch (error) {
    console.error('Error fetching courses:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to fetch courses'
    });
  }
};

const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('tutor', 'name userIcon');
      
    if (!course) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Course not found'
      });
    }
    res.status(httpStatus.OK).json(course);
  } catch (error) {
    console.error('Error fetching course:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to fetch course'
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.Price) {
      updates.Price = Math.round(updates.Price * 100);
    }

    // Reset disapproval reason when course is updated
    if (!updates.is_approved) {
      updates.disapprovalReason = null;
    }

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, tutor: req.user._id },
      updates,
      { new: true }
    ).populate('tutor', 'name userIcon');

    if (!course) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Course not found or unauthorized'
      });
    }
    res.status(httpStatus.OK).json(course);
  } catch (error) {
    console.error('Error updating course:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to update course'
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      tutor: req.user._id
    });
    
    if (!course) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Course not found or unauthorized'
      });
    }
    res.status(httpStatus.OK).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to delete course'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('categories');
    res.status(httpStatus.OK).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  getMyCourses,
  getPendingCourses,
  approveCourse,
  disapproveCourse
};