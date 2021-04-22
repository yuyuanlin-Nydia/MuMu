var express = require("express");
var router = express.Router();
const multer = require('multer');
var conn = require("../db");

var myStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./upload/article"); // 保存的路徑 (需先自己創建)
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // 自定義檔案名稱
    }
});

var upload = multer({
    storage: myStorage, // 設置 storage
});

router.post('/upload_file', upload.single('myfile'), function (req, res, next) {
    res.send("上傳成功");
});



router.get("/", function (req, res) {
	res.redirect("/article/1")
})
// 分頁
router.get('/:page([0-9]+)', function (req, res) {
	var page = req.params.page;
	var count = 5;
	var offset = (page - 1) * count;
	// limit要放最後
	var sql = `SELECT * FROM articleinfo where articleDelete = ? limit ${offset},${count} ;
            SELECT COUNT(*) AS COUNT FROM articleinfo`
	conn.query(sql, [0], function (err, result) {
		if (err) { console.log(err); };
		var last_page = Math.ceil((result[1][0].COUNT) / count)
		var data = result;
		// 	如果超過最大頁數 就到編號1的文章
		if (page > last_page || page < 1) {
			res.redirect("/article/1")
		}
		res.render('./article/article_all.html', {
			data: data[0],
			lastPage: last_page
		})
	});
})
// 文章的資料到/data下 去拿
router.get("/data", function (req, res) {
	var connection = require("../db");
	connection.query('select * from articleinfo where articleDelete = ?',
		[0],
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			res.send(JSON.stringify(rows));
		})
})

// 個別的文章
router.get("/item/:no", function (req, res) {
	var no = req.params.no;
	var sql = `SELECT * FROM articlecomment where articleId=?;
	select * from articleinfo where articleId=? and articleDelete = ?`
	conn.query(sql, [no, no, 0], function (err, rows) {
		if (err) {
			console.log(JSON.stringify(err));
			return;
		}
		// res.send({
		// 	data: rows
		//   });
		res.render('./article/article_single.ejs', {
			article: JSON.stringify(rows[1]),
			comment: JSON.stringify(rows[0])
		});
	});
})



module.exports = router;