var express = require("express");
var router = express.Router();
var conn = require("../db");
var {Success,Error} = require('./response')

// 如果已登入導向會員頁
router.get("/", function (req, res) {
	if (req.session.userinfo) {
		res.redirect('/user')
	} 
	else if (req.session.companyinfo){
		res.redirect('/company')
	}
	else {
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
router.get("/companySignup", function (req, res) {

	res.render('./log/loginCompany.html')
})
// 抓資料/寫入沒問題
// router.post('/login', function (req, res) {
// 	var body = req.body;
// 	console.log(body);
// })

// 一般註冊
router.post('/signup', function (req, res) {
	var body = req.body;
	var sql = `INSERT INTO userinfo (firstName, userEmail,userAccount ,userPassword) VALUES ( ?, ?, ?, ?);`
	var data = [body.firstName, body.userEmail, body.userAccount, body.userPassword]
	conn.query(sql, data, function (error,results, fields) {
		if(results){
		    res.end(
		        JSON.stringify(new Success('insert success'))
		    )
		} else {
		    res.end(
		        JSON.stringify(new Error('insert failed'))
		    )
		}
		
	})

})
// 企業註冊
router.post('/companySignup', function (req, res) {
	var body = req.body;
	var sql = `INSERT INTO companyinfo (companyTaxNo,companyName,companyAccount ,companyPassword,companyEmail) VALUES ( ?, ?, ?, ?,?);`
	var data = [body.companyTaxNo, body.companyName, body.companyAccount, body.companyPassword, body.companyEmail]
	conn.query(sql, data, function (error,results, fields) {
		if(results){
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
//一般登入
router.post('/login', function (req, res) {
	var body = req.body;

	var sql = `SELECT * FROM userinfo WHERE userAccount=? and userPassword=?;`
	var data = [body.userAccountL, body.userPasswordL]
	conn.query(sql, data, function (error,results, fields) {
		console.log(results);
		if(results[0]) {
            req.session.userinfo = {
                id: results[0].userId,
                account: results[0].userAccount,
                name: results[0].firstName,
                phone: results[0].userPhone,
                email: results[0].userEmail,
                file: results[0].userFile,
                area: results[0].userArea,
                birth: results[0].userBirth,
                add: results[0].userAdd,
                dis: results[0].userDis,
                area: results[0].userArea,
                avatar: results[0].userFile,
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
//企業登入
router.post('/companyLogin', function (req, res) {
	var body = req.body;

	var sql = `SELECT * FROM companyinfo WHERE companyAccount=? and companyPassword=?;`
	var data = [body.companyAccountL, body.companyPasswordL]
	conn.query(sql, data, function (error,results, fields) {
		if(results[0]) {
            req.session.companyinfo = {
                cid: results[0].companyId,
                cAccount: results[0].companyAccount,
                cName: results[0].companyName,
				cPhone: results[0].companyPhone,
                cEmail: results[0].companyEmail,
                cFile: results[0].companyFile,
                cArea: results[0].companyArea,
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
    // console.log(locals.session);   
    next();
});
// 登出
router.get('/logout', function (req, res) {
	req.session.destroy(); //刪除session
	res.redirect('/');  //重新導向首頁
});

// 檢查帳號(一般會員)
router.post('/check',function(req, res){
	var body = req.body;
	var sql = `select userId from userinfo where userAccount=?`
	var data = [body.userAccount]
	conn.query(sql, data, function (error,results, fields) {

		if(results[0]) {
            res.end(
				JSON.stringify('Account being used'),
            )
        } else {
            res.end(
                JSON.stringify(new Success('checked ok')),
            )
        }
    })
})

// 檢查帳號(企業會員)
router.post('/checkC',function(req, res){
	var body = req.body;
	var sql = `select companyId from companyinfo where companyAccount=?`
	var data = [body.companyAccount]
	conn.query(sql, data, function (error,results, fields) {
		// console.log(results[0]);
		if(results[0]) {
            res.end(
				JSON.stringify('Account being used'),
            )
        } else {
            res.end(
                JSON.stringify(new Success('checked ok')),
            )
        }
    })
})
module.exports = router;