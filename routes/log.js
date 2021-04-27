var express = require("express");
var router = express.Router();
var conn = require("../db");
var {Success,Error} = require('./response')

// 如果登入導向會員頁
router.get("/", function (req, res) {
	if (req.session.user) {
		res.redirect('/user')
	} else {
		res.render('./log/loginPre.html')
	}
})

router.get("/login", function (req, res) {

	res.render('./log/login.ejs')
})
router.get("/signup", function (req, res) {

	res.render('./log/login.ejs')
})
router.get("/companyLogin", function (req, res) {

	res.render('./log/loginCompany.html')
})

// 抓資料/寫入沒問題
// router.post('/login', function (req, res) {
// 	var body = req.body;
// 	console.log(body);
// })

// 註冊
router.post('/signup', function (req, res) {
	var body = req.body;
	var sql = `INSERT INTO userinfo (firstName, userEmail,userAccount ,userPassword) VALUES ( ?, ?, ?, ?);`
	var data = [body.firstName, body.userEmail, body.userAccount, body.userPassword]
	conn.query(sql, data, function (error,results, fields) {
		if(results.insertId){
		    res.end(
		        JSON.stringify(new Success('insert success'))
		    )
		} else {
		    res.end(
		        JSON.stringify(new Error('insert failed'))
		    )
		}
		console.log(results);
	})

})
//登入
router.post('/login', function (req, res) {
	var body = req.body;

	var sql = `SELECT * FROM userinfo WHERE userAccount=? and userPassword=?;`
	var data = [body.userAccountL, body.userPasswordL]
	conn.query(sql, data, function (error,results, fields) {
		console.log(results);
		if(results[0]) {
            req.session.userinfo = {
                id: results[0].id,
                account: results[0].userAccount,
            }
            res.end(
                JSON.stringify(new Success('login success')),
				
            )
        } else {
            res.end(
                JSON.stringify(new Error('login failed'))
            )
        }
    })
})
router.use(function(req, res, next){
    res.locals.session = req.session;
    console.log(req.session.username);   
    next();
});
//登出
// router.get('/logout', function (req, res) {
// 	req.session.destroy(); //刪除session
// 	res.redirect('/');  //重新導向首頁
// });
module.exports = router;