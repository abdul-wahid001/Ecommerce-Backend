var express = require('express');
var router = express.Router();
const {protect,authorize} = require('../middleware/auth'); 
const {createUser,getUser,getUsers,deleteUser,updateUser} = require('../controllers/users');
const User = require('../models/User');

router.use(protect);
router.use(authorize('admin'));

/*  POST GET Users/User. */
router.route('/').get(getUsers).post(createUser);
/* PUT GET DELETE Single USER. */
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
