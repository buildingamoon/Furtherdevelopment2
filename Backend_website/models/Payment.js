const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const paymentSchema = new mongoose.Schema({
  productName: {
    type: String,
  },
  price: {
    type: Number,
  },
  status: {
    type: String,
  },
  paymentid: {
    type: String,
  },
  user_id: { // New field to store user ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  email:{
    type: String,
  },
  name:{
    type: String,
  },
  course_id: { // Reference to Product/Course
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course' 
  },
}, {
  timestamps: true,
});

paymentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Payment', paymentSchema);
