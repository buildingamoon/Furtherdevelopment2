const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const discussionSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    content: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    startDate:{ type: Date },
    endDate: { type: Date },
    startTime: { type: String},
    type: { type: String, enum: ['discussion', 'event'], required: true },
    emoji: { type: String },
    roomId: { type: String },
    photos: {
        type: [String], // Array of URLs for photos hosted on Amazon AWS
        required: false,
    },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
    
});

discussionSchema.plugin(mongoosePaginate);

module.exports = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);
