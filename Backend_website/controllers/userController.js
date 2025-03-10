// controllers/userController.js
const User = require('../models/User');
const httpStatus = require('../utils/httpStatus');
const Post = require('../models/Post');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('user_id');
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }
    res.status(httpStatus.OK).json({ user: { name: user.name, email: user.email, role: user.role, userIcon: user.userIcon, user_id: user.user_id } });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).populate('user_id');
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }
    console.log('Updated user icon:', user.userIcon); // Add logging
    res.status(httpStatus.OK).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};


const getUserByEmail = async (req, res) => {
    const { email } = req.query;
    console.log(`Received request to fetch user by email: ${email}`); // Debugging log
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`User found: ${user.name}`); // Add logging
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      res.status(500).json({ message: error.message });
    }
  };

  const getUserByPostId = async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        console.log('Post not found');
        return res.status(404).json({ message: 'Post not found' });
      }
  
      console.log('Post found:', post);
  
      const user = await User.findById(post.user_id).select('-password');
      if (!user) {
        console.log('User not found with ID:', post.user_id);
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log('User found:', user);
  
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user data by post ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  

module.exports = {
  getProfile,
  updateProfile,
  getUserByEmail,
  getUserByPostId,
};
