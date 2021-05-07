var express = require("express");
var router = express.Router();
var conn = require("../db");
const multer = require('multer');
var { Success, Error } = require('./response')

router.get("/", function (req, res) {
	function dateString(e) {
		var mmddyy = new Date(e);
		var date = mmddyy.getFullYear().toString() + "年" + (mmddyy.getMonth() + 1).toString() + "月" + mmddyy.getDate().toString() + "日";
		return date;
		}
	var sql = `SELECT a.activityId,companyName,activityTitle,activityFile,activityLocation,sellDate FROM activityinfo a INNER JOIN companyinfo c on(a.companyId=c.companyId) WHERE c.companyId=? AND del=0 ORDER BY sellDate DESC`;
	
	var session = req.session.companyinfo;
	// var data = [session.cid];
	var data = [session.cid];
	// console.log(session.cid);
	conn.query(sql,data,
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./company/company_mainPage.ejs', {
				// data: JSON.stringify(rows)

				data: rows,
				Caccount: session.cAccount,
				Cname: session.cName,
				Cphone: session.cPhone,
				Cmail:session.cEmail,
				Cfile:session.cFile,
				
			});
		}
	);

})

// router.get("/", function (req, res) {

// })



router.get("/edit", function (req, res) {
	var sql ='select * from companyinfo inner join area on companyinfo.areaId = area.areaId inner join district on area.districtId = district.districtId where companyAccount = ?;';
	var session = req.session.companyinfo;
	var data = [session.cAccount];
	conn.query(sql,data,
		function (err, rows) {
			
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./company/company_edit.ejs', {
				// data: JSON.stringify(rows)
				data: rows
			});
		}
	);
	
	// res.render('./company/company_edit.ejs')

});
// router.get("/edit/detail/:id([0-9]+)", function (req, res){
// 	var sql ='select * from companyinfo inner join area on companyinfo.areaId = area.areaId inner join district on area.districtId = district.districtId where companyinfo.companyid = ?;';
// 	var data = [3];
// 	conn.exec(sql, data, function(results, fields) {
// 		//當有查詢結果資料時
// 		 if(results[0]){
			 
// 			 //JSON.stringify函式將一個JavaScript物件轉換成文字化的JSON。不能被文字化的屬性會被忽略。
// 			 // Success建構式,new一個物件,哪個物件要看response.js
// 			 res.end(
// 				 JSON.stringify(new Success(results[0]))
// 			 )
// 		 } else {
// 		   //JSON.stringify函式將一個JavaScript物件轉換成文字化的JSON。不能被文字化的屬性會被忽略。
// 			 // Error建構式,new一個物件,哪個物件要看response.js
// 			 res.end(
// 				 JSON.stringify(new Error('no result'))
// 			 )
// 		 }
// 	 })
// })




router.get("/myArticle", function (req, res) {
	
	res.redirect('/company')

});


//編輯表單
// index.post('/update', login_api, function(req, res){
//     var body = req.body
//     var sql = `UPDATE companyinfo SET name = ?, phone = ?, address = ?, adult_mask = ?, child_mask = ? WHERE id = ?`;
//     var data = [body.name, body.phone, body.address, parseInt(body.adult_mask), parseInt(body.child_mask), parseInt(body.id)]
//     // 要知道要改哪個資料所以要把data設成exec()的參數
//     db.exec(sql, data, function(results, fields) {
//         //affectedRows(生效的列)
//         if(results.affectedRows){
//             res.end(
//                  //JSON.stringify函式將一個JavaScript物件轉換成文字化的JSON。不能被文字化的屬性會被忽略。
//                 JSON.stringify(new Success('update success'))
//             )
//         } else {
//             res.end(
//                  //JSON.stringify函式將一個JavaScript物件轉換成文字化的JSON。不能被文字化的屬性會被忽略。
//                 JSON.stringify(new Error('update failed'))
//             )
//         }
//     })
// })


// 刪除活動POST
router.post('/delete', function (req, res) {
    var body = req.body;
    var data = parseInt(body.activityId);

	// sql=`UPDATE activityband SET del =1 WHERE activityId = ${data};
    // UPDATE activitydetails SET del =1 WHERE activityId = ${data};
    // UPDATE activityinfo SET del =1 WHERE activityId = ${data};
    // UPDATE activityprice SET del =1 WHERE activityId = ${data};`
	sql=`UPDATE activityinfo SET del =1 WHERE activityId = ${data};`

	// console.log(sql);
    conn.query(sql, function (error, results, fields) {
        if (results) {
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


module.exports = router;