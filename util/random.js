module.exports = function(num){ //创造一个随机数
	let sum = []
	for(let i=0; i<num; i++){
		sum.push(Math.floor(Math.random() * 10))
	}
	return sum.join('')
}