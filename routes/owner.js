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
  var name = req.body.businessName;
  var mobile = req.body.mobile;
  var id = string_to_slug(name);

  console.log(name, mobile, id);

  sql.connect(config).then(pool => {
    return pool.request()
      .input('id', sql.VarChar, id)
      .input('name', sql.VarChar, name)
      .input('mobile', sql.VarChar, mobile)
      .query('INSERT INTO OWNERS(id, name, mobile) VALUES (@id, @name, @mobile)')}) // .input('input_parameter', sql.Int, value)
      .then(result => {
        console.log('registration success.')
        res.json({"status": "done", "id":id});
      })
      .catch(err => {
        console.log('Error:', err);
        res.json({"status": "error"});
    });
})

module.exports = router;

function string_to_slug (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

  return str;
}
