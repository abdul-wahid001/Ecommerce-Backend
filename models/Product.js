const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a Title'],
        unique: true,
        trim: true,
        maxlength: [150, 'Title can not be more than 150 characters']
      },
    image:  {
        type: String,
        default: 'no-photo.jpg',
      },
    images: [
        { 
            type: String,
            required: [true, 'Please add a valid image URL']
        }
    ],
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters'],
      },
    price: { 
        type: Number, 
         required: [true,"Please Enter a valid price"]
    },
    quantity:  { 
        type: Number,
         required: [true,"Please Enter a valid price"]
    },
    shortDesc: { 
        type: String,
        required: [true,"Please Enter a Short Description"]
    },
    category:{
        type: String,
        required:  true,
        enum: [
          'Shoes',
          'Electronics'
        ],
      }

});
ProductSchema.virtual('id').get(function(){
  return this._id.toHexString();
});
ProductSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Product', ProductSchema);