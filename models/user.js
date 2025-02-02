var mongoose = require("mongoose")

var produtSchema = new mongoose.Schema({
	"userId" : String,
	"userName" : String,
	"userPwd" : String,
	"orderList" : Array,
	"cartList" : [
	  {
	  	"productId" : String,
	  	"productName" : String,
	  	"salePrice" : String,
	  	"productImage" : String,
	  	"checked" : String,
	  	"productNum" : Number
	  }
	],
	"addressList" : [
	  {
	  	'addressId' : String,
	  	'userName' : String,
	  	'streetName' : String,
	  	'postCode' : Number,
	  	'tel' : Number,
	  	'isDefault' : Boolean
	  }
	]
})

module.exports = mongoose.model("User",produtSchema)