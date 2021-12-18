const express = require('express');
const {auth, adminAuth, checkUser} = require('../middleware/auth');
const Book = require('../models/bookModel');

const router = express.Router();

router.get('/book-shop', checkUser, function(req, res) {
    res.render('shop/index', { title: 'Book shop', user: req.user});
});

// router.get('/book-shop/bottom-div', function(req, res) {
//     res.render('partials/bottomDiv', {layout: 'layouts/empty'});
// });

router.get('/book-shop/bottom-div-admin', function(req, res) {
    res.render('partials/bottomDivAdmin', {layout: 'layouts/empty'});
});

router.get('/book-shop/cart', checkUser, function(req, res) {
    res.render('shop/cart', { title: 'Cart', replaceCart: true, user: req.user});
});

router.post('/books/new', auth, adminAuth, async (req, res) => {
    const book = new Book({
        ...req.body
    });

    try{
        await book.save();
        res.send(book);
    }catch(err){
        res.status(400).send(err);
    };
});

router.get('/books/get', checkUser, async (req, res) => {
    const _id = req.query.id;

    try{
        const {imgSrc, imgAlt, price} = await Book.findOne({_id});
        if(!(price))
            return res.status(404).send({
                status: 404,
                message: "book not found!"
            });
        
        res.send({imgSrc, imgAlt, price});
    }catch(err){
        res.status(500).send(err);
    };
});

router.post('/books/rate', checkUser, async (req, res) => {
    const _id = req.body.id;
    const rating = parseInt(req.body.rating);

    try{
        const book = await Book.findOne({_id});
        const newRating = ((book.rating*book.reviews)+rating)/(book.reviews+1);
        book.rating = newRating;
        book.reviews++;
        await book.save();

        
        res.status(200).send({newRating});
    }catch(err){
        res.status(500).send(err);
    };
});

router.get('/books/search-terms', async (req, res) => {
    try{                                       
        const books = await Book.find({});
        let termsArray = [];
        for(let book of books){
            termsArray.push(book.name, book.author);
        };
        res.send(termsArray)        
    }catch(err){
        res.status(500).send(err);
    };
});

router.get('/books/search', async (req, res) => {
    try{                                     
        const matchingBookNames = await Book.find({name: req.query.searchInput});
        const matchingAuthors = await Book.find({author: req.query.searchInput});
        const results = [...matchingBookNames, ...matchingAuthors];
        res.send(results);      
    }catch(err){
        res.status(500).send(err);
    };
});

router.get('/books/get-all', async (req, res) => {
    try{
        const books = await Book.find();

        if(!books)
            return res.status(404).send({
                status: 404,
                message: "books not found!"
            });
        
        res.send(books);
    }catch(err){
        res.status(500).send(err);
    };
});

router.delete('/books/delete', auth, async (req, res) => {    
    const _id = req.query.id;

    try{
        const book = await book.findOneAndDelete({_id, user: req.user._id});

        if(!book)
            return res.status(404).send({
                status: 404,
                message: "book not found"
                        });
        
        res.send();

    }catch(err){
        res.status(500).send(err);
    };
});

router.patch('/books/edit', async (req, res) => {
    const allowdUpdates = ['name', 'author', 'genre', 'description', 'price', 'imgSrc', 'imgAlt', 'stock'];    

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

        const _id = req.query.id;
        const book = await Book.findOneAndUpdate(
            {_id}, 
            req.body, 
            {new:true, runValidators:true}
            );

        await book.save();

        res.send(book);
    }catch(err){
        res.status(400).send({
            status: 400,
            message: err.message
        });
    };
});

router.get('/books/all', auth, async (req, res) => {
    const match = {};
    const options = {};
    
    if(req.query.completed)
        match.completed = req.query.completed === "true";  
        
    if(req.query.limit)
        options.limit = parseInt(req.query.limit);

    if(req.query.skip)
        options.skip = parseInt(req.query.skip);

    if(req.query.sortDate){
        options.sort = {};
        options.sort.createdAt = req.query.sortDate === 'desc' ? -1 : 1;
    }

    try{
        await req.user.populate({
            path: 'books',
            match,
            options
        }).execPopulate();

        if(req.user.books.length<1)
            return res.status(404).send({
                status: 404,
                message: "No books found"
            });
        
        res.send(req.user.books);
    }catch(err){
        res.status(500).send(err);
    };
});

module.exports = router;