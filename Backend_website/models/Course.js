const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  promotionUrl: {
    type: String,
  },
  categories: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  learningOutcomes: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // Duration in hours
    required: true,
  },
  photos: {
    type: [String],
    required: false,
  },
  Price: {
    type: Number, 
  },
  is_featured: {
    type: Boolean,
  },
  is_approved: {
    type: Boolean,
    default: false
  },
  disapprovalReason: {
    type: String,
  },
  learningModes: {
    type: [String],
    enum: ['Video', 'Audio/Podcast', 'Reading materials/article/e-book', 'Seminar/live streaming/Q&A', 'Other'],
    validate: {
      validator: function(v) {
        return v.length > 0; // At least one learning mode required
      },
      message: 'At least one learning mode is required'
    }
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isCrowdfunding: {
    type: Boolean,
    default: false
  },
  crowdfunding: {
    minStudents: Number,
    startDate: Date,
    startupFee: Number,
    currentStudents: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  // New fields for future features
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

courseSchema.plugin(mongoosePaginate);

courseSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('title')) {
      return next();
    }
    this.slug = slugify(this.title, { lower: true, strict: true });

    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const postsWithSlug = await this.constructor.find({ slug: slugRegEx });

    if (postsWithSlug.length) {
      this.slug = `${this.slug}-${postsWithSlug.length + 1}`;
    }

    // Calculate crowdfunding progress if applicable
    if (this.isCrowdfunding && this.crowdfunding.minStudents > 0) {
      this.crowdfunding.progress = (this.crowdfunding.currentStudents / this.crowdfunding.minStudents) * 100;
    }

    // Calculate average rating if there are ratings
    if (this.ratings && this.ratings.length > 0) {
      const totalScore = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
      this.averageRating = totalScore / this.ratings.length;
      this.totalRatings = this.ratings.length;
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Course', courseSchema);