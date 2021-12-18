const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Customer = require('../models/customerModel');

const auth = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        const data = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await Customer.findOne({
            _id: data._id,
            'tokens.token': token
        });

        if(!user)
            throw new Error();

        req.user = user;
        req.token = token;
        next();
    }catch(err){
        res.status(400).send({
            status: 400,
            message: 'Not authenticated'
        });
    };
};

const adminAuth = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        const data = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await User.findOne({
            _id: data._id,
            'tokens.token': token
        });

        if(!user)
            throw new Error();

        req.user = user;
        req.token = token;
        next();
    }catch(err){
        res.status(400).send({
            status: 400,
            message: 'Not authenticated'
        });
    };
}

const checkUser = async (req, res, next) => {    
    try{   
        const token = req.cookies.jwt;

        if(!token){
            return next();
        };

        const data = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await Customer.findOne({
            _id: data._id,
            'tokens.token': token
        }) || await User.findOne({
            _id: data._id,
            'tokens.token': token
        });

        if(user){
            req.user = user;
        };      

        next();
    }catch(err){
        res.status(500).send(err);
    };
};

module.exports = {
    auth,
    adminAuth,
    checkUser
};