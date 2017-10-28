var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

const jwksRsa = require('jwks-rsa');
var jwtAuthz = require('express-jwt-authz');
const jwt = require('express-jwt');


//Get All Users

// Authentication middleware. When used, the
// access token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and 
    // the singing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://vivenda.auth0.com/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: 'http://localhost:3000/api',
    issuer: 'https://vivenda.auth0.com/',
    algorithms: ['RS256']
});


const checkScopes = jwtAuthz(['read:users']);

router.get('/users', checkJwt, checkScopes, function(req, res){
    var db = req.app.get("userdb");
    db.UserInfo.find(function(err, users){
        if(err){
            res.send(err);
        }
        
        res.json(users);
    });
});

// Get Single User
router.get('/user/:id', function(req, res, next){
    var db = req.app.get("userdb");
    db.UserInfo.findOne({_id: mongojs.ObjectId(req.params.id)}, function(err, task){
        if(err){
            res.send(err);
        }
        res.json(task);
    });
});

//Save User
router.post('/user', function(req, res){
    var db = req.app.get("userdb");
    var user = req.body;
        db.UserInfo.save(user, function(err, user){
            if(err){
                res.send(err);
            }
            res.json(user);
        })
});

// Update User
router.put('/user/:id', function(req, res, next){
    var db = req.app.get("userdb");
        var user = req.body;
        db.UserInfo.update({_id: mongojs.ObjectId(req.params.id)},user, {}, function(err, user){
        if(err){
            res.send(err);
        }
        res.json(user);
    });
});

// Delete User
router.delete('/user/:id', function(req, res, next){
    var db = req.app.get("userdb");
    db.UserInfo.remove({_id: mongojs.ObjectId(req.params.id)}, function(err, user){
        if(err){
            res.send(err);
        }
        res.json(user);
    });
});


module.exports = router;