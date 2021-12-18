const mongoose = require('mongoose');
const validator = require('validator');
const ValidatePassword = require('validate-password');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Book = require('./bookModel');

const customerSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        default: 'Guest'
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('invalid email');
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            const passwordData = new ValidatePassword().checkPassword(value);
            if(!passwordData.isValid){
                throw new Error(passwordData.validationMessage);
            }                
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
},{
    timestamps: true
});

customerSchema.pre('save', async function (next) {
    const customer = this;

    if(customer.isModified('password'))
    customer.password = await bcrypt.hash(customer.password , 8);

    next();
});

customerSchema.statics.findUserByEmailAndPassword = async (email, password) => {
    const customer = await Customer.findOne({email});

    if(!customer)
        throw new Error('Unable to log in1');

    const isPassMatch = await bcrypt.compare(password, customer.password);

    if(!isPassMatch)
        throw new Error('Unable to log in2');

    return customer;
};

customerSchema.methods.generateAuthToken = async function (){
    const customer = this;
    const token = jwt.sign({
        _id: customer._id
    },
    process.env.TOKEN_SECRET,
    {
        expiresIn: "6h"
    });
    
    customer.tokens = customer.tokens.concat({token});
    await customer.save();

    return token;
};

customerSchema.methods.toJSON = function (){
    const customer = this
    const customerObj = customer.toObject();

    delete customerObj.password;
    delete customerObj.tokens;

    return customerObj;
};

customerSchema.virtual("books", {
    ref: "Book",
    localField: "book",
    foreignField: "_id"
});
        
// customerSchema.pre('remove', async function (next){
//     const user = this;

//     await Book.deleteMany({user: user._id});
//     next();
// });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;