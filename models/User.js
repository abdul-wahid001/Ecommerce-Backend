const bcypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('./RefreshToken'); 

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required: [true, 'Please add a name']
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:[
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
            'Please add a valid email'
        ]
    },
    role:{
        type:String,
        enum:['user' ],
        default:'user'
    },
    password:{
        type:String,
        required:[true, 'Please add a Password'],
        minlength:6,
        select:false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
});
UserSchema.pre('save', async function (next){
    if(!this.isModified('password')){
       next(); 
    }
    const salt = await bcypt.genSalt(10); 
    this.password = await bcypt.hash(this.password,salt);
    next(); 
});

// Sign JWT
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
    });
}
//Match user password
UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcypt.compare(enteredPassword, this.password);

} 

//Generate and hash the password token
UserSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex'); 
    this.resetPasswordExpire = Date.now()+ 10*60*1000;
    return resetToken;
}

UserSchema.methods.generateRefreshToken = function(ipAddress) {
    return new RefreshToken({
        user: this._id,
        token:crypto.randomBytes(40).toString('hex'),
        expires: new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRE*24*60*60*1000),
        createdByIp: ipAddress
    });
  }

UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
  });
UserSchema.set('toJSON', {
    virtuals: true
  });
// Encrypt Password
module.exports = mongoose.model('User', UserSchema);
