var express = require('express');
var router = express.Router();
var {register,login, getMe,forgotPassword, resetPassword,updateDetails, updatePassword, refreshToken, revokeToken} = require('../controllers/auth');
const {protect} = require('../middleware/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect,getMe);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);
router.route('/updatedetails').put(protect,updateDetails);
router.route('/updatepassword').put(protect,updatePassword);
router.route('/refreshtoken').post(refreshToken);
router.route('/revoketoken').post(protect,revokeToken);
module.exports = router;