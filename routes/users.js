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

router.get("/checkLogin",function(req,res,next){ //检测是否之前已经登入过了
  if(req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName || ''
    })
  }else{
    res.json({
      status:'1',
      msg:'未登入',
      result:''
    })
  }
})

router.get("/cartList",function(req,res,next){ //获取购物车信息
  if(req.cookies.userId){
    var userId = req.cookies.userId
    User.findOne({"userId":userId},function(err,doc){
      if(err){
        res.json({
          status:"0",
          msg:err.message,
          result:''
        })
      }else{
        if(doc){
          res.json({
            status:'1',
            msg:'',
            result:doc.cartList
          })
        }
      }
    })
  }
})

router.post("/cartDel",function(req,res,next){  //删除购物车中的数据
  let userId = req.cookies.userId,productId = req.body.productId
  User.update({userId:userId},{
    $pull:{"cartList":{"productId":productId}}
  },function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:"0",
          msg:'',
          result:'suc'
        })
      }
    }
  })
})

router.post("/cartEdit",function(req,res,next){ //更改商品的数量
  let userId = req.cookies.userId,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked
  User.update({"userId":userId,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked,
  },function(err,doc){
    console.log(doc)
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    } else {
      if(doc){
        res.json({
          status:0,
          msg:'',
          result:'suc'
        })
      }
    }
  })
})

router.post("/editCheckAll",function(req,res,next){ //全选或反选
  let userId = req.cookies.userId,
      checkAllFlag = req.body.checkAllFlag ? '1' : '0'
  User.findOne({'userId':userId},function(err,user){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    } else {
      if(user){
        user.cartList.forEach((item) => {
          item.checked = checkAllFlag
        })
        user.save(function(err2,doc){
          if(err2){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            })
          } else {
            res.json({
              status:'0',
              msg:'',
              result:'suc'
            })
          }
        })
      }
    }
  })
})

module.exports = router;
