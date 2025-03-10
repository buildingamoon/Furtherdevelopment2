const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
    },
    categories: {
    type: [String],
    required: true,
    },
    description: {
    type: String, // Text area for description, can include text symbols, photos, emojis, etc.
    required: true,
    },
    no_of_stock_available: {
        type: Number,
        required: true,
    },
    color: {
        type: [String], 
        required: false,
    },
    size: {
        type: [String], 
        required: false,
    },
    photos: {
    type: [String], // Array of URLs for photos hosted on Amazon AWS
    required: false,
    },
    slug:{
        type:String,
        unique:true,
    }
  

}, {
    timestamps: true,
});

productSchema.plugin(mongoosePaginate);

const slugify = require('slugify');  // Add this import


productSchema.pre('save', async function(next) {
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


module.exports = mongoose.model('Product', productSchema);