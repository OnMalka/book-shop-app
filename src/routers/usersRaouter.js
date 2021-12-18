const express = require('express');
const User = require('../models/userModel.js');
const Customer = require('../models/customerModel.js');
const {auth, adminAuth, checkUser} = require('../middleware/auth.js');

const router = express.Router();

router.post('/users/new', async (req, res) => {    
    const customer = new Customer(req.body);    
    try{
            
        const token = await customer.generateAuthToken();
        await customer.save();
        
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000*60*60*6, sameSite: 'lax'}); // 6h exp date like the auth token
        console.log(customer);
        res.send({customer, token});
    }catch(err){
        res.status(400).send({
            status: 400,
            message: err.message
        });
    };
});

router.get('/admin', adminAuth, function(req, res) {
    res.render('shop/admin', { title: 'Admin', replaceCart: true, user: req.user});
});

router.get('/book-shop/signup', function(req, res) {
    res.render('users/signup', { title: 'Sign up', replaceSignup: true});
});

router.get('/book-shop/login', function(req, res) {
    res.render('users/login', { title: 'Log in', replaceLogin: true});
});

router.patch('/users/edit', auth, async (req, res) => {
    const allowdUpdates = ['name', 'age', 'email', 'password'];
    const _id = req.user._id;

    try{
        if(Object.getOwnPropertyNames(req.body).length > allowdUpdates.length)
            return res.status(400).send({
                status: 400,
                message: "Too many properties",
                allowdUpdates
            });

        for(let update in req.body){
            if(!allowdUpdates.includes(update)){
                return res.status(400).send({
                    status: 400,
                    message: "Update property invalid",
                    property: update
                });
            }
        }

        const user = req.user;

        for(let update in req.body){
            user[update] = req.body[update];
        }

        await user.save();

        res.send(user);
    }catch(err){
        res.status(400).send({
            status: 400,
            message: err.message
        });
    };
});

router.delete('/users/delete', auth, async (req, res) => {    
    try{
        await req.user.remove();

        res.send();

    }catch(err){
        res.status(500).send(err);
    };
});

router.post('/users/login', async (req, res) => {
    try{
        const customer = await Customer.findUserByEmailAndPassword(req.body['email'], req.body['password']);
        const token = await customer.generateAuthToken();
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000*60*60*6, sameSite: 'lax'});
        res.send({customer, token});
    }catch(err){
        res.status(400).send({
            status: 400,
            message: err.message
        });
    }
});

router.post('/admins/login', async (req, res) => {
    try{
        const admin = await User.findUserByEmailAndPassword(req.body['email'], req.body['password']);
        const token = await admin.generateAuthToken();
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000*60*60*6, sameSite: 'lax'});
        res.send({admin, token});
    }catch(err){
        console.log(err)
        res.status(400).send({
            status: 400,
            message: err.message
        });
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((tokenDoc)=>tokenDoc.token !== req.token);
        await req.user.save();
        res.cookie('jwt', '', {httpOnly: true, maxAge: 1, sameSite: 'lax'});// set to empty string and exp date of 1 ms
        res.redirect('/book-shop');
    }catch(err){
        res.status(500).send(err);
    }
});

router.post('/admins/logout', adminAuth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((tokenDoc)=>tokenDoc.token !== req.token);
        await req.user.save();
        res.cookie('jwt', '', {httpOnly: true, maxAge: 1, sameSite: 'lax'});// set to empty string and exp date of 1 ms
        res.redirect('/book-shop');
    }catch(err){
        res.status(500).send(err);
    }
});

router.post('/users/logout/all', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.cookie('jwt', '', {httpOnly: true, maxAge: 1, sameSite: 'lax'});
        res.send();
    }catch(err){
        res.status(500).send(err);
    }
});

router.get('/users/regen-token', auth, async(req, res) => {    
    try{    
        const user = req.user;    
        user.tokens = user.tokens.filter((tokenDoc)=>tokenDoc.token !== req.token);
        const token = await user.generateAuthToken();
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000*60*60*6, sameSite: 'lax'});
        res.send(token);
    }catch(err){
        res.status(400).send({
            status: 400,
            message: err.message
        });
    };
});

module.exports = router;