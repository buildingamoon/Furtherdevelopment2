const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require('slugify'); // Add this import

// Define the Course schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  promotionUrl: {
    type: String, // URL for promotion
  },
  categories: {
    type: [String],
    required: true,
  },
  description: {
    type: String, // Text area for description, can include text symbols, photos, emojis, etc.
    required: true,
  },
  photos: {
    type: [String], // Array of URLs for photos hosted on Amazon AWS
    required: false,
  },
  Price: {
    type: Number, 
  },
  is_featured: {
    type: Boolean,
  },
  videos: [{
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    tutorremarks: {
      type: String,
    },
  }],
  slug: {
    type: String,
    unique: true,
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

// Add pagination plugin
courseSchema.plugin(mongoosePaginate);

// Pre-save hook to generate unique slugs based on title
courseSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('title')) {
      return next();
    }
    this.slug = slugify(this.title, { lower: true, strict: true });

    // Check for uniqueness
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const postsWithSlug = await this.constructor.find({ slug: slugRegEx });

    if (postsWithSlug.length) {
      this.slug = `${this.slug}-${postsWithSlug.length + 1}`;
    }
    next();
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

module.exports = mongoose.model('Course', courseSchema);
