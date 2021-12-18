const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        unique: true
    },
    author: {
        type: String,
        required:true
    },
    genre: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    rating: {
        type: Number,
        default: 5
    },
    reviews: {
        type: Number,
        default: 1
    },
    imgSrc:{
        type:String
    },
    imgAlt:{
        type:String,
        default: 'Book image'
    },
    stock: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;