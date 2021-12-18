const express = require('express');
const {auth, adminAuth, checkUser} = require('../middleware/auth');
const Item = require('../models/cartItemModel');
const Book = require('../models/bookModel');
const Db = require('mongodb');

const router = express.Router();

router.post('/items/new', checkUser, async (req, res) => {   
    try{
        const userId = req.user?._id || req.cookies.cart || Db.ObjectId();

        const {stock} = await Book.findById(req.body.book);

        const existingItem = await Item.findOne({book: req.body.book, user: userId});
        if(existingItem){
            if(stock <= existingItem.amount)
                throw new Error({
                    status: 409,
                    message: 'Store is out of stock!'
                })
            existingItem.amount++;
            await existingItem.save();
            res.send(existingItem);
        }else{
            if(stock < 1)
                throw new Error({
                    status: 409,
                    message: 'Store is out of stock!'
                })

            const item = new Item({
                ...req.body,
                user: userId
            });

            if(!req.user)
                item.expires_at = Date.now() + 1000*60*60*24*7;

            // await Item.createIndexes({ expire_at: 1 }, { expireAfterSeconds: 0 });
            await Item.syncIndexes();            

            await item.save();
            if(!(req.user && req.cookies.cart))
                res.cookie('cart', userId, {httpOnly: false, maxAge: 1000*60*60*24*14, sameSite: 'lax'}); // 2 weeks for guest exp date
            res.send(item);
        }        
    }catch(err){
        res.status(400).send(err);
    };
});

router.get('/items/get', checkUser, async (req, res) => {
    try{
        const userId = req.user?._id || req.cookies.cart;
        if(!userId)
                return res.status(404).send({
                    status: 404,
                    message: "cart not found"
                });

        const items = await Item.find({user: userId});

        if(items?.length < 1)
            return res.status(404).send({
                status: 404,
                message: "no items in cart"
            });
                               
        res.send(items);
    }catch(err){
        res.status(500).send(err);
    };
});

router.patch('/items/convert-to-new-user', checkUser, async (req, res) => {
    try{
        // console.log('convert start')
        const userId = req.user?._id;
        const oldId = req.cookies?.cart;

        if(!oldId)
                return res.status(404).send({
                    status: 404,
                    message: "cart not found"
                });

        const items = await Item.find({user: oldId});

        if(items?.length < 1)
            return res.status(404).send({
                status: 404,
                message: "no items in cart"
            });

        for(let item of items){
            item.user = userId;
            await item.save();
        };

        res.cookie('cart', '', {httpOnly: true, maxAge: 1, sameSite: 'lax'});
                               
        res.send(items);
    }catch(err){
        res.status(500).send(err);
    };
});

router.delete('/items/delete', checkUser, async (req, res) => {
    try{
        const item = await Item.findOneAndDelete({_id: req.body.itemId, user: req.user?._id || req.cookies.cart});

        if(!item)
            return res.status(404).send({
                status: 404,
                message: "Item not found"
                        });
                
        res.send();
    }catch(err){
        res.status(500).send(err);
    };
});

router.post('/items/change-amount', checkUser, async (req, res) => {   
    try{
        const {stock} = await Book.findById(req.body.book);
        if(stock < req.body.amount)
            throw new Error({
                    status: 409,
                    message: 'Store is out of stock!'
                })

        if(req.body.amount < 1)
            throw new Error({
                message: 'Use cancel button to remove item from list'
            })
        const userId = req.user?._id || req.cookies.cart;

        const existingItem = await Item.findOne({book: req.body.book, user: userId});
        existingItem.amount = req.body.amount;
        await existingItem.save();
        res.send(existingItem);
                
    }catch(err){
        res.status(400).send(err);
    };
});

// router.patch('/tasks/edit', auth, async (req, res) => {
//     const allowdUpdates = ['description', 'completed'];    

//     try{
//         if(Object.getOwnPropertyNames(req.body).length > allowdUpdates.length)
//             return res.status(400).send({
//                 status: 400,
//                 message: "Too many properties",
//                 allowdUpdates
//             });

//         for(let update in req.body){
//             if(!allowdUpdates.includes(update)){
//                 return res.status(400).send({
//                     status: 400,
//                     message: "Update property invalid",
//                     property: update
//                 });
//             }
//         }

//         const _id = req.query.id;
//         const task = await Task.findOneAndUpdate(
//             {_id, user: req.user._id}, 
//             req.body, 
//             {new:true, runValidators:true}
//             );

//         await task.save();

//         res.send(task);
//     }catch(err){
//         res.status(400).send({
//             status: 400,
//             message: err.message
//         });
//     };
// });

// router.get('/tasks/all', auth, async (req, res) => {
//     const match = {};
//     const options = {};
    
//     if(req.query.completed)
//         match.completed = req.query.completed === "true";  
        
//     if(req.query.limit)
//         options.limit = parseInt(req.query.limit);

//     if(req.query.skip)
//         options.skip = parseInt(req.query.skip);

//     if(req.query.sortDate){
//         options.sort = {};
//         options.sort.createdAt = req.query.sortDate === 'desc' ? -1 : 1; ///asc
//     }

//     try{
//         // await req.user.populate("tasks").execPopulate();
//         await req.user.populate({
//             path: 'tasks',
//             match,
//             options
//         }).execPopulate();

//         if(req.user.tasks.length<1)
//             return res.status(404).send({
//                 status: 404,
//                 message: "No tasks found"
//             });
        
//         res.send(req.user.tasks);
//     }catch(err){
//         res.status(500).send(err);
//     };
// });

module.exports = router;