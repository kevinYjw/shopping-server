var express = require('express');
var router = express.Router();
var mongoose = require("mongoose")
var Goods = require("../models/goods")
var Users = require("../models/User")

//链接数据库
mongoose.connect("mongodb://127.0.0.1:27017/demo")

var db = mongoose.connection

db.on("connected",function(){
	console.log("MongoDB connected success.")
})

db.on("error",function(){
	console.log("MongoDB connected fail.")
})

db.on("disconnected",function(){
	console.log("MongoDB connected disconnected.")
})

router.get("/list", function(req, res, next){
	let sort = req.param("sort")
	let page = parseInt(req.param("page"))
	let pageSize = parseInt(req.param("pageSize"))
	let priceLevel = req.param("priceLevel")
	let skip = (page - 1) * pageSize
	var priceGt = '',priceLte = ''
	let params = {}
	if(priceLevel != 'all'){
		switch (priceLevel){
      case '0':priceGt = 0;priceLte=100;break;
      case '1':priceGt = 100;priceLte=500;break;
      case '2':priceGt = 500;priceLte=1000;break;
      case '3':priceGt = 1000;priceLte=5000;break;
    }
    params = {
      salePrice:{
          $gt:priceGt,
          $lte:priceLte
      }
    }
	}
	let GoodsModel = Goods.find(params).skip(skip).limit(pageSize)
	GoodsModel.sort({"salePrice":sort})
	GoodsModel.exec(function(err,doc){
		if(err){
			res.json({
				status : "1",
				msg : err.message
			})
		} else {
			res.json({
				status : "0",
				msg : "",
				result : {
					count : doc.length,
					list : doc
				}
			})
		}
	})
});

router.post("/addCart",function(req,res,next){
	let productId = req.body.productId,userId=req.cookies.userId
	Users.findOne({'userId':userId},function(err,userDoc){
		if(err){
			res.json({
				status:"1",
				msg:err.message
			})
		} else {
			if(userDoc){
				var goodsItem = ''
				userDoc.cartList.forEach((item) => {
					if(item.productId === productId){
						goodsItem = item
						item.productNum++
					}
				})
				if(goodsItem){
					userDoc.save(function(err2,doc2){
						if(err2){
							res.json({
								status:"1",
								msg:err2.message
							})
						}else{
							res.json({
								status:'0',
								msg:'',
								result:'suc'
							})
						}
					})
				}else{
					Goods.findOne({productId:productId},function(err1,doc){
						if(err1){
							res.json({
								status:"1",
								msg:err.message
							})
						}else{
							if(doc){
								doc.productNum = 1
								doc.checked = 1
								userDoc.cartList.push(doc)
								userDoc.save(function(err2,doc2){
									if(err2){
										res.json({
											status:"1",
											msg:err2.message
										})
									}else{
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
				}
			}
		} 
	})
})

module.exports = router;