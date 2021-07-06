const { NotExtended } = require('http-errors');
const mongoose = require('mongoose');
const ErrorResponse = require('../helpers/errorResponse');
const Product = require('./Product');
const OrderSchema = mongoose.Schema(//Order
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },

    productsOrdered: [
      {
        _id: false,
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
});


OrderSchema.pre('save', async function (next) {
  console.log(this.productsOrdered);
  for (let i =0 ; i < this.productsOrdered.length; i++){
    try {
      let product = await this.model('Product').findById(this.productsOrdered[i].product);
      if (product.quantity == 0){
        return next(new ErrorResponse('Product is out of Stock',400))
      }
      this.productsOrdered[i].quantity =  this.productsOrdered[i].quantity > product.quantity ? product.quantity: this.productsOrdered[i].quantity;
      product.quantity -=  this.productsOrdered[i].quantity;
      await product.save();
    } catch (error) {
      return next(error);
    }
  }
  next();
});
OrderSchema.virtual('id').get(function(){
  return this._id.toHexString();
});
OrderSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Order', OrderSchema);
