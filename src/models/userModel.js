const mongoose = require('mongoose');
const validator = require('validator');
const ValidatePassword = require('validate-password');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Book = require('./bookModel');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        default: 'Admin'
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
    admin: {
        type: Boolean,
        default: true
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

userSchema.pre('save', async function (next) {
    const user = this;

    if(user.isModified('password'))
        user.password = await bcrypt.hash(user.password , 8);

    next();
});

userSchema.statics.findUserByEmailAndPassword = async (email, password) => {
    const user = await User.findOne({email});

    if(!user)
        throw new Error('Unable to log in1');

    const isPassMatch = await bcrypt.compare(password, user.password);

    if(!isPassMatch)
        throw new Error('Unable to log in2');

    return user;
};

userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({
        _id: user._id
    },
    process.env.TOKEN_SECRET,
    {
        expiresIn: "6h"
    });
    
    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
};

userSchema.methods.toJSON = function (){
    const user = this
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;

    return userObj;
};

userSchema.virtual("cartItems", {
    ref: "Cart",
    localField: "_id",
    foreignField: "user"
});

userSchema.pre('remove', async function (next){
    const user = this;

    await Book.deleteMany({user: user._id});
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;