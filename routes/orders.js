var express = require('express');
var router = express.Router();
const {getAllOrders,getOrderById,placeNewOrder,payment} = require('../controllers/orders');
const {protect} = require('../middleware/auth'); 


router.use(protect);

/* GET All Orders. */
router.route('/').get(getAllOrders).post(placeNewOrder);
/* GET Single Order. */
router.route('/:orderId').get(getOrderById);

// Fake payment methods 
router.route('/payment').post(payment);

module.exports = router;
