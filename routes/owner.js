var QRCode = require('qrcode')
var express = require('express');
var router = express.Router();
const sql = require('mssql')
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv").config();
const axios = require('axios');


const config = {
  user: 'dingding_admin',
  password: process.env.DB_PASSWORD,
  server: 'dingding.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
  database: 'dingding',
}

sql.on('error', err => {
  console.log(err);
})

router.post('/login', function(req,res) {
  try{
    console.log(req.body);

    sql.connect(config).then(pool => {
    return pool.request()
    .input('mobile', sql.VarChar, req.body.username)
    .query('SELECT * FROM owners WHERE mobile = @mobile ')}) // .input('input_parameter', sql.Int, value)
    .then(result => {
      var record = result.recordset[0];
      if (req.body.password == record.password)
      {
        const token = generateAccessToken({ username: req.body.username, id:record.id, name:record.name });
        res.json({token: token});
      }
      else
      {
        res.json(401, {error:1, message: "Invalid username or password"});        
      }
    })
    .catch(err => {
      console.log('Error', err);
      res.json(403, {error:1, message: "Invalid username or password"});
    });
    
  }
  catch (err) {
    console.log(err);
  }
  
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

router.get('/:id/list', function(req, res, next) {
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

router.post('/checkin/:id', function(req, res) {
  var id = req.params.id;
  var customerName = req.body.customerName
  var mobile = req.body.mobile;

  sql.connect(config).then(pool => {
    return pool.request()
      .input('id', sql.VarChar, id)
      .input('customerName', sql.VarChar, customerName)
      .input('mobile', sql.VarChar, mobile)
      .query('INSERT INTO CHECKINS(shopId, customerName, mobile) VALUES (@id, @customerName, @mobile)')}) // .input('input_parameter', sql.Int, value)
      .then(result => {
        console.log('checkin success.')
        res.json({"status": "done", "check-in": "true"});
      })
      .catch(err => {
        console.log('Error:', err);
        res.json({"status": "error"});
  });
} )

router.get('/', function(req, res, next) {
  var auth = req.headers.authorization;
  var token = auth.split(' ')[1];
  var decoded = jwt.decode(token);

  console.log('decoded:', decoded)

  res.json({"user": {
    name: decoded.username,
    id: decoded.id,
    displayname: decoded.name
  }
  });
})

router.post('/', async function(req, res,next) {
  var name = req.body.businessName;
  var mobile = req.body.mobile;
  var id = string_to_slug(name);

  var password = generateOTP();

  var smsCommand = `https://www.sms123.net/api/send.php?apiKey=${process.env.SMS_API_KEY}&recipients=${mobile}&messageContent=Your verification code for getdingding.com is ${password}.&referenceID=${id}`;
  
  const smsResponse = await axios.get(smsCommand)
  console.dir(smsResponse);

  if (smsResponse.data.status != 'ok'){
    res.json({
      "status": "error",
      "error": smsResponse.data.statusMsg
    });
    return;
  }
  
  sql.connect(config).then(pool => {
    return pool.request()
      .input('id', sql.VarChar, id)
      .input('name', sql.VarChar, name)
      .input('mobile', sql.VarChar, mobile)
      .input('password', sql.VarChar, password)
      .query('INSERT INTO OWNERS(id, name, mobile, password) VALUES (@id, @name, @mobile, @password)')}) // .input('input_parameter', sql.Int, value)
      .then(result => {
        console.log('registration success.')
        res.json({"status": "done", "id":id});
      })
      .catch(err => {
        console.log('Error:', err);
        res.json({
          "status": "error",
          "error": err
      });
    });
})



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

function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function generateOTP() { 
          
  // Declare a digits variable  
  // which stores all digits 
  var digits = '0123456789'; 
  let OTP = ''; 
  for (let i = 0; i < 6; i++ ) { 
      OTP += digits[Math.floor(Math.random() * 10)]; 
  } 
  return OTP; 
} 

module.exports = router;