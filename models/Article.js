var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique: true
    },

    link: {
        type: String,
        required: true,
        // unique: true
    },

    summary: {
        type: String,
        required: true
    },

    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }],

    saved: {
        type: Boolean,
        default: false,
        required: true
    }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
