const mongoose = require('mongoose');

const termsconditionSchema = new mongoose.Schema({
    description: {
        type: String
    },
    type: {
        type: String,
        default: 'text'
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("termscondition", termsconditionSchema);
