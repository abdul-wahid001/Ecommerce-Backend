const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const ErrorResponse  = require ('../helpers/errorResponse'); 

// @desc Get all users
// @route POST /api/auth/users
// @access Private/admin

exports.getUsers = asyncHandler ( async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({success:true,count:users.length,data:users});
});


// @desc Get user by id 
// @route GET /api/auth/users/:id
// @access Private/admin
exports.getUser = asyncHandler ( async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(
          new ErrorResponse(`User not found with id of ${req.params.id}`,404)
          );
      }
    res.status(200).json({success:true,data:user});
});



// @desc create a User
// @route POST /api/auth/users
// @access Private/admin
exports.createUser = asyncHandler ( async(req,res,next)=>{
    const user = await User.create(req.body);
    res.status(201).json({success:true,data:user});
});



// @desc Update a User
// @route PUT /api/auth/users/:id
// @access Private/admin
exports.updateUser = asyncHandler ( async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({success:true,data:user});
});

// @desc Delete a User
// @route DELETE /api/auth/users/:id
// @access Private/admin
exports.deleteUser = asyncHandler ( async(req,res,next)=>{
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({success:true,data:{}});
});
