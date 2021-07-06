const Product = require('../models/Product');
const ErrorResponse = require('../helpers/errorResponse');
const asyncHandler = require('../middleware/async');

exports.addProduct = asyncHandler(async (req,res,next)=>{
  
  const product = new Product(req.body);
  const savedProd = await product.save();
  res.status(201).json({success:true,data: savedProd});
});  

exports.getAllProducts = asyncHandler(async function (req, res) {
  console.log(req.query);
  const page = parseInt(req.query.page,10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1)* limit;
  const endIndex = page*limit;
  const total = await Product.countDocuments();
  let products = await Product.find().skip(startIndex).limit(limit);
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
  res.status(200).json({success:true, count:total,pagination,data:products});
});

exports.getProductById =asyncHandler(async function (req,res,next) {
    let productId = req.params.prodId;
    let product = await Product.findById(productId);
    if(!product){
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.prodId}`,404)
        );
    }
    return res.status(200).json({success:true, data:product});
  
});

exports.getProductsByCategory = (req,res)=>{

    let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page : 1;
    const limit = (req.query.limit != undefined && req.query.limit != 0) ? req.query.limit : 10;
  
    let startValue;
    let endvalue;
  
    if (page > 0) {
      startValue = (page * limit) - limit;
      endvalue = page * limit;
  
    } else {
      startValue = 0;
      endvalue = 10;
    }
    const cat_title = req.params.catName;
    
    database.table('products as p')
    .join([{
      table: 'categories as c',
      on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
  
    }])
    .withFields(
      ['c.title as category',
       'p.title as name',
       'p.price',
       'p.quantity',
       'p.description',
       'p.image',
       'p.id'])
    .slice(startValue, endvalue)
    .sort({ id: .1 })
    .getAll()
    .then(prod => {
      if (prod.length > 0) {
        res.status(200).json({
          count: prod.length,
          products: prod
        })
      } else {
        res.json({ message: `No products found from ${cat_title} category` });
      }
    }).catch(err => {
      console.log(err);
    });
};

