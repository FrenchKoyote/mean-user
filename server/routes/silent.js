var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render(path.join(__dirname, './')+'/silent.html');
});

module.exports = router;