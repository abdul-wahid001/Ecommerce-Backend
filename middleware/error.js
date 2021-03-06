const ErrorResponse = require("../helpers/errorResponse");

const errorHandler = (err, req, res, next)=>{
    let error = {...err};
    error.message = err.message;
    console.log(err.stack.red);
    // Malformed ID Error
    if(err.name === 'CastError'){
        const message = `Resource not found with id of ${err.value}`;
        error  = new ErrorResponse(message,404);
    }
    if(err.code === 11000){
        const message = 'Duplicate field value entered';
        error  = new ErrorResponse(message,400); 

    }
    // Mongoose Validation  Check failures
    if(err.name == 'ValidationError'){
        const message = Object.keys(err.errors).map(error=> err.errors[error].message);
        error  = new ErrorResponse(message,400);
    }
    res.status(error.statusCode || 500 ).json({
        success:false,
        error: error.message || 'Server Error'
    });
};
module.exports = errorHandler;