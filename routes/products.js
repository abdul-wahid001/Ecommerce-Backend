const express = require('express');
const router = express.Router();
const {getAllProducts,getProductById,getProductsByCategory, addProduct} = require('../controllers/products');

const {protect, authorize} = require('../middleware/auth'); 


router.route('/').get(getAllProducts).post(protect,authorize('admin'), addProduct);
router.route('/:prodId').get(getProductById);
router.route('/category/:catName').get(getProductsByCategory);
module.exports = router;
