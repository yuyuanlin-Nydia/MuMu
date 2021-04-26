var express = require("express");
var router = express.Router();
var conn = require("../db");

router.get("/", function (req, res) {

	
			res.render('./log/loginPre.html')
	
})
router.get("/login", function (req, res) {

	res.render('./log/login.ejs')
})
router.get("/companyLogin", function (req, res) {

			res.render('./log/loginCompany.html')
})



// router.post('/login', function(req, res){
//     var body = req.body;
// 	console.log(body);
// })

router.post('/login',function(req,res){
	var body = req.body;
	var sql =  `INSERT INTO userinfo (firstName, userEmail,userAccount ,userPassword) VALUES ( ?, ?, ?, ?);`
	var data = [body.firstName,body.userEmail, body.userAccount, body.userPassword]
	conn.query(sql, data, function(results, fields) {
		        // if(results.insertId){
		        //     res.end(
		        //         JSON.stringify(new Success('insert success'))
		        //     )
		        // } else {
		        //     res.end(
		        //         JSON.stringify(new Error('insert failed'))
		        //     )
		        // }
				// console.log(results);
		    })

})
module.exports = router;