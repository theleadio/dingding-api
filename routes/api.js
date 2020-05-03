var QRCode = require('qrcode')
var express = require('express');
var router = express.Router();

/* Generate QR code using promise */
router.get('/', async function(req, res, next) {
  QRCode.toDataURL("https://www.getdingding.com",{width: 300})
  .then(url => {
    // console.log(url);
    var data = url.replace(/^data:image\/png;base64,/, '')
    var img = Buffer.from(data, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img); 
    // res.sendFile(url);
  })
  .catch(err => {
    console.log(err);
  })
});

/* Generate QR code using promise */
router.get('/:id', async function(req, res, next) {
  var id = req.params.id;
  QRCode.toDataURL("https://www.getdingding.com/checkin/"+id,{width: 300})
  .then(url => {
    // console.log(url);
    var data = url.replace(/^data:image\/png;base64,/, '')
    var img = Buffer.from(data, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img); 
    // res.sendFile(url);
  })
  .catch(err => {
    console.log(err);
  })
});


// router.get('/:id', )

// /* Generate QR code using Async */
// router.get('/', async function(req, res, next) {
//   qr = await QRCode.toDataURL("Show me my pony");
//   console.log(qr);
//   res.send('show my QR code here');
  
// });

module.exports = router;
