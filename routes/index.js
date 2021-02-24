var express = require('express');
var router = express.Router();

var spatial = require('../model/spatial');


router.get('/getMvt/*/*/*', (req, res, next) => {
  spatial.getMvt(req, res, next);
});



module.exports = router;
