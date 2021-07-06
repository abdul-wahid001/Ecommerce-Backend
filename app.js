const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const app = express();
const mongoose = require('mongoose');
const ErrorResponse = require('./helpers/errorResponse');
require('dotenv/config');

app.use(cors());

//connect to db
mongoose.connect( process.env.DB_CONNECTION,{ useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true }).then(()=>{
  console.log('Connnected to Database'.cyan.underline.bold);
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//register Routes
const productRoute = require('./routes/products');
const ordersRoute = require('./routes/orders');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');

app.use('/api/products',productRoute);
app.use('/api/orders',ordersRoute);
app.use('/api/auth',authRoute);
app.use('/api/users',usersRoute);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new ErrorResponse('Not Found',404));
});

// error handler
app.use(errorHandler);

module.exports = app;
