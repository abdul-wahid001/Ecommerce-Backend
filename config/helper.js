const Mysqli = require('mysqli');
let conn = new Mysqli({
    Host:'localhost',
    post: 3306,
    user:'abdul',
    passwd:'test1234',
    db: 'mega_shop'
});
let db = conn.emit(false,'');



const secret = "zcZHd1zfQGLDkh9_xtZmkcD_";

module.exports = {
    database: db,
};