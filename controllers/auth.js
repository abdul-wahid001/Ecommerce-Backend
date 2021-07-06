const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const ErrorResponse  = require ('../helpers/errorResponse'); 
const sendEmail = require('../helpers/sendEmail');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');


// @desc Register User
// @route POST /api/auth/register
// @access Public 

exports.register = asyncHandler ( async(req,res,next)=>{
    const ipAddress = req.ip;
    const { name, email, password, role } = req.body;
    // Create User
    const user = await User.create({
        name,
        email,
        password,
        role
    });    
    sendTokenResponse(ipAddress,user,200, res);
});



// @desc Login User
// @route POST /api/auth/login
// @access Public 

exports.login = asyncHandler(async(req,res, next)=>{
    const {email, password} = req.body;
    const ipAddress = req.ip;
    if(!email || !password){
        return next (new ErrorResponse('Please provide an email and password',400));
    }
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return next (new ErrorResponse('Invalid Credentials',401));
    }
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next (new ErrorResponse('Invalid Credentials',401));
    }

    sendTokenResponse(ipAddress,user,200, res);

});



// @desc Get the logged in user
// @route POST /api/auth/me
// @access Public 
exports.getMe = asyncHandler (async (req,res, next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    });
});
 
// @desc Forgot Password
// @route POST /api/auth/forgotpassword  
// @access Public 
exports.forgotPassword = asyncHandler (async (req,res, next)=>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new ErrorResponse('There is no user with that email',404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    // create reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    const message = `Please make a PUT request to: \n\n ${resetURL}`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        });
        res.status(200).json({success:true,data:'Email Sent'});

    } catch (error) {
        console.log(error);
        user.resetPasswordToken= undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorResponse('Email could not be sent', 500));
        
    }
});


// @desc Reset Password
// @route PUT /api/auth/resetpassword/:resettoken
// @access Public 
exports.resetPassword = asyncHandler (async (req,res, next)=>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');


    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    if(!user){
        return next(new ErrorResponse('Invalid token',400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    await sendTokenResponse(user,200, res);
});



// @desc Update User Details
// @route PUT /api/auth/updatedetails
// @access Private 
exports.updateDetails = asyncHandler (async (req,res, next)=>{
    const fieldsToUpdate = {
        name:req.body.name,
        email:req.body.email
    };
    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        success:true,
        data:user
    });
});


// @desc Update Password
// @route PUT /api/auth/updatepassword
// @access Private 
exports.updatePassword = asyncHandler (async ({req,res, next})=>{
    const user = await User.findById(req.user.id).select('+password');
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect',401));
    }
    user.password = req.body.newPassword;
    await user.save();
    await sendTokenResponse(user,200, res);
});


exports.refreshToken = asyncHandler (async (req,res, next)=>{
    if(!req.headers.refreshtoken){
        return (next(new ErrorResponse('Provide a vaid Refresh token',400)));
    }
    const token = req.headers.refreshtoken;
    const ipAddress = req.ip;

    const refreshToken = await RefreshToken.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive){
        return (next(new ErrorResponse('Acess Denied',401)));
    }
    const user = await User.findById(refreshToken.user);
    const newRefreshToken = user.generateRefreshToken(ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const idToken = user.getSignedJwtToken();
    res.status(200).json({
        success:true,
        idToken,
        expires: new Date(Date.now()+ process.env.JWT_EXPIRE[0] * 24 * 60 * 60 *1000),
        refreshToken:newRefreshToken.token
    });

});

exports.revokeToken = asyncHandler(async (req,res,next)=>{
    if(!req.headers.refreshtoken){
        return (next(new ErrorResponse('Provide a vaid Refresh token',400)));
    }
    const token = req.headers.refreshtoken;
    const ipAddress = req.ip;

    const refreshToken = await RefreshToken.findOne({token});

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
    res.status(200).json({success:true});

});
//GEt token from model and create a cookie response

const sendTokenResponse = async (ip,user, statusCode, res)=>{
    const idToken = user.getSignedJwtToken();
    
    const refreshToken = user.generateRefreshToken(ip);
    await refreshToken.save();
    res.status(statusCode).json({
        success:true,
        idToken,
        expires: new Date(Date.now()+ process.env.JWT_EXPIRE[0] * 24 * 60 * 60 *1000),
        refreshToken:refreshToken.token

    });

}

