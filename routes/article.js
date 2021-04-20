var express = require("express");
var router = express.Router();
var conn = require("../db");
// 依 HTTP 的 Method (POST/GET/PUT/DELETE) 進行增查修刪
router.get("/", function (req, res) {
	
	conn.query('select * from articleinfo',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./article/article_all.html')
		}
	);

})
// router.get("/", function(req, res) {
//     res.redirect("/1") //如果後面沒有指定數字 就到編號1的文章
// })
// router.get("/:id", function(req, res) {
//     conn.connect(function(err) {
//             // res.send(JSON.stringify(err));
//         })
//         //傳達指令
//     conn.query("select * from articleinfo where articleId=?", [req.params.id], function(err, result) {
//             res.send(JSON.stringify(result));
//         })

// })



module.exports = router;