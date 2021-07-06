
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

exports.getAllOrders = asyncHandler(async (req, res) => {
    console.log(req.query);
    const page = parseInt(req.query.page,10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1)* limit;
    const endIndex = page*limit;
    const total = await Order.countDocuments();
    let orders = await Order.find().populate([{
        path:'user',
        select: 'name email'
    },
    {
        path:'productsOrdered',
        populate: {
            path:'product',
            select: 'title description price image id'
        }
        
    }]).skip(startIndex).limit(limit);
    const pagination = {};
    if(endIndex<total){
      pagination.next = {
        page:page+1,
        limit
      };
    }
    if (startIndex>0){
      pagination.prev ={
        page:page -1,
        limit
      }
    }
    res.status(200).json({success:true,data:orders});
});

exports.placeNewOrder = asyncHandler(async (req, res) => {

    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json({success:true,data:savedOrder});
});

exports.payment = (req, res) => {
    setTimeout(() => {
        res.status(200).json({ success: true })
    }, 3000);
};

exports.getOrderById = async (req, res) => {
    const order =await Order.findById(req.params.orderId).populate([{
        path:'user',
        select: 'name email id'
    },
    {
        path:'productsOrdered',
        populate: {
            path:'product',
            select: 'title description price image id'
        }
        
    }]);
    res.status(200).json({success:true,data:order});
};