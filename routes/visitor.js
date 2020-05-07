var QRCode = require('qrcode')
var express = require('express');
var router = express.Router();
const sql = require('mssql')
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config();


const config = {
  user: 'dingding_admin',
  password: process.env.DB_PASSWORD,
  server: 'dingding.database.windows.net', 
  database: 'dingding',
}

sql.on('error', err => {
  console.log(err);
})


router.get('/:id', function(req, res, next) {
  var id = req.params.id;
  sql.connect(config).then(pool => {
    return pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM checkins WHERE shopid = @id ')}) // .input('input_parameter', sql.Int, value)
      .then(result => {
        console.dir(result);
        res.json(result.recordset);
      })
      .catch(err => {console.log('Error', err);
    });
});

module.exports = router;