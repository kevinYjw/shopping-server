var express = require('express');
var router = express.Router();
var User = require("../models/User")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/login",function(req,res,next){
  let param = {
  	userName : req.body.userName,
  	userPwd : req.body.password
  }
  User.findOne(param,function(err,doc){
  	if(err){
  		res.json({
  			status:"1",
  			msg:err.message
  		})
  	}else{
  		if(doc){
  			res.cookie("userId",doc.userId,{
  				path:'/',
  				maxAge:1000*60*60
  			})
  			res.cookie("userName",doc.userName,{
  				path:'/',
  				maxAge:1000*60*60
  			})
  			res.json({
  				status:'0',
  				mas:'',
  				result:{
  					userName:doc.userName
  				}
  			})
  		}else{
  			res.json({
  				status:'-1',
  				msg:'',
  				result:""
  			})
  		}
  	}
  })
})

router.post("/logout",function(req,res,next){
	res.cookie("userId","",{
		path:'/',
		maxAge:-1
	})
	res.json({
		status:"0",
		msg:'',
		result:''
	})
})

module.exports = router;
