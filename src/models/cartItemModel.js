const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Book'
    },
    amount: {
        type: Number,
        default: 1
    },
    expires_at: { 
        type: Date, 
        default: null,
        expires: '3m'
    }
}, {
    timestamps: true
});


// cartItemSchema.virtual("book", {
//     ref: "Book",
//     localField: "book",
//     foreignField: "_id"
// });

// customerSchema.methods.setExpirationDate = async function (){
//     const cart = this;
    
//     cart.

//     await cart.save();

//     return;
// };

const Item = mongoose.model("Item", cartItemSchema);

module.exports = Item;