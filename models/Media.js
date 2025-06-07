const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String, // e.g., image, video, application/pdf
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema); 