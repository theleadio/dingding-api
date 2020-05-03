var QRCode = require('qrcode')
var express = require('express');
var router = express.Router();
const sql = require('mssql')

const config = {
  user: 'dingding_admin',
  password: 'Uc@n3548690',
  server: 'dingding.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
  database: 'dingding',
}

sql.on('error', err => {
  // console.log(err);
})

/* Generate QR code using promise */
router.get('/', function(req, res, next) {

  sql.connect(config).then(pool => {
    // Query
    
    return pool.request()
      .query('SELECT * FROM owners')}) // .input('input_parameter', sql.Int, value)
      .then(result => {
        console.dir(result);
        res.json(result.recordset);
      })
      .catch(err => {console.log('Error', err);
    });
});

router.get('/:id', function(req, res, next) {
  var id = req.params.id;
  sql.connect(config).then(pool => {
    return pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM owners WHERE id = @id ')}) // .input('input_parameter', sql.Int, value)
      .then(result => {
        console.dir(result);
        res.json(result.recordset);
      })
      .catch(err => {console.log('Error', err);
    });
});


router.post('/', function(req, res,next) {
  console.log(req.body);
  res.json({"status": "done"});
})

module.exports = router;
