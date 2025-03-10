const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  categories: {
    type: [String],
  },
  menberonly: {
    Boolean,
  },
  is_featured: {
    type: Boolean,
  },
  photos:{
    type: String,
    required: true
  },
  slug:{
    type:String,
    unique:true,
},
user_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
},
}, {
  timestamps: true,
});

postSchema.plugin(mongoosePaginate);

const slugify = require('slugify');  // Add this import


postSchema.pre('save', async function(next) {
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
   next(error);  // Pass any errors to the next middleware
 }
});


module.exports = mongoose.model('Post', postSchema);
