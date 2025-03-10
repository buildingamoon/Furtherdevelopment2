const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const videoSchema = new mongoose.Schema({
    title: { type: String,  },
    description: { type: String,  },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
    video: {
        type: [String], // Array of URLs for photos hosted on Amazon AWS
        required: false,
    },

}, { timestamps: true });

videoSchema.plugin(mongoosePaginate);

module.exports = mongoose.models.Video || mongoose.model('Video', videoSchema);