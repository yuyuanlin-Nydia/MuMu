var express = require("express");
var router = express.Router();
var conn = require("../db");
// 依 HTTP 的 Method (POST/GET/PUT/DELETE) 進行增查修刪
router.get("/", function (req, res) {

	conn.query('select * from activityinfo',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./activity/activity_all.html')
		}
	);

})
router.get("/single", function (req, res) {

	conn.query('select * from activityinfo',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./activity/activity_single.html')
		}
	);

})
router.get("/create", function (req, res) {

	conn.query('select * from activityinfo',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./activity/activity_create.html')
		}
	);

})


// 文章的資料到/data下 去拿
router.get("/data", function (req, res) {
	var connection = require("../db");
	connection.query('select * from activityinfo',
		[],
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			res.send(JSON.stringify(rows));
		})
})

// router.post('/update', function(req, res){
//     var body = req.body
//     // var sql = `UPDATE inventory SET activityTitle = ?, performDate = ?, activityLocation = ?, areaId = ?, activityAddress = ? ticketAmount = ?`;
// 	var sql =`INSERT INTO userInfo(activityTitle, performDate, activityLocation,areaId,activityAddress, ticketAmount)VALUES 
// 	(?, ?, ?, ?, ?, ?);`

//     var data = [body.activityTitle, body.performDate, body.activityLocation, parseInt(body.areaId), body.activityAddress, parseInt(body.ticketAmount)]
//     db.exec(sql, data, function(results, fields) {
//         if(results.affectedRows){
//             res.end(
//                 JSON.stringify(new Success('update success'))
//             )
//         } else {
//             res.end(
//                 JSON.stringify(new Error('update failed'))
//             )
//         }
//     })
// })




module.exports = router;