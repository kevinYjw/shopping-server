var express = require('express');
var router = express.Router();
var User = require("../models/User")
var random = require('../util/random.js')
var currentTime = require('../util/Date.js')

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

router.get("/addressList",function(req,res,next){ //配送方式初始化
  let userId = req.cookies.userId
  User.findOne({'userId':userId},function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:doc.addressList
        })
      }
    }
  })
})

router.post('/setDefault',function(req,res,next){  //设置默认配送地址
  let userId = req.cookies.userId,
      addressId = req.body.addressId

  User.findOne({"userId":userId},function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    } else {
      if(doc){
        if(doc.addressList.length === 0){
          res.json({
            status:'2',
            msg:'',
            result:'未设置地址'
          })
        }
        doc.addressList.forEach((item) => {
          if(item.addressId === addressId){
            item.isDefault = !item.isDefault
          } else {
            item.isDefault = false
          }
        })
        doc.save(function(err2,doc2){
          if(err2){
            res.json({
              status:"1",
              msg:err.message,
              result:''
            })
          } else {
            if(doc2){
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              })
            }
          }
        })
      }
    }
  })
})

router.post("/delAddress",function(req,res,next){  //删除地址
  let userId = req.cookies.userId,
      addressId = req.body.addressId

  User.update({"userId":userId},{
    $pull:{'addressList':{"addressId":addressId}}
  },function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    } else {
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

router.post("/addAddress",function(req,res,next){ //添加地址
  let userId = req.cookies.userId
  let param = {
    'addressId' : req.body.addressId,
    'userName' : req.body.userName,
    'streetName' : req.body.streetName,
    'postCode' : req.body.postCode,
    'tel' :req.body.tel,
    'isDefault' : false
  }

  User.findOne({'userId':userId},function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    } else {
      if(doc){
        doc.addressList.push(param)
        doc.save(function(err2,doc2){
          if(err2){
            res.json({
              status:"1",
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

router.post("/payMent",function(req,res,next){  //提交订单
  let userId = req.cookies.userId,
      addressId = req.body.addressId,
      orderTotal = req.body.orderTotal,
      goodsList = req.body.goodsList,
      orderId = random(19),
      createDate = currentTime(),
      addressInfo,
      param

  User.findOne({'userId':userId},function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    } else {
      if(doc){
        doc.addressList.forEach((item) => {
          if(item.addressId === addressId){
            addressInfo = item
          }
        })
        param = {
          'orderId' : orderId,
          'orderTotal' : orderTotal,
          'addressInfo' : addressInfo,
          'goodsList' : goodsList,
          'orderStatus' : '1',
          'createDate' : createDate
        }
        doc.orderList.push(param)
        doc.save(function(err2,doc2){
          if(err2){
            res.json({
              status:"1",
              msg:err.message,
              result:''
            })
          } else {
            if(doc2){
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              })
            }
          }
        })
      }
    }
  })
})

module.exports = router;
