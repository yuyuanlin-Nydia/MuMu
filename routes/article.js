var express = require("express");
var router = express.Router();
const multer = require('multer');
var conn = require("../db");

var myStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/image/upload/article"); // 保存的路徑 (需先自己創建)
	},
	filename: function (req, file, cb) {
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
		res.render('./article/article_all.ejs', {
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
	var no=req.params.no
	if(no<0){
		res.redirect("/item/1");
	}
	res.render('./article/article_single.ejs');
});
// 第四個sql語句到時候要去抓session的值
router.get("/item/data/:no", function (req, res) {
	var no = req.params.no;
	var sql = `select ai.articleId,ai.articleTitle, ai.articleContent,ai.articleTime,ai.articleFile,ui.firstName,ui.lastName,ui.userFile from articleinfo as ai join userinfo as ui on ui.userId=ai.userId where articleId=? and articleDelete = ?
	;
	SELECT ac.commentContent,ac.commentTime,ui.userAccount,ui.userFile  FROM articlecomment as ac
	join userInfo as ui on ui.userId= ac.userId
	where articleId=? and commentDelete=?;
	SELECT COUNT(*) as COUNT from articlecomment where articleId=? and commentDelete=?;
	SELECT userFile from userInfo where userAccount="abc123" 
	`
	conn.query(sql, [no, 0, no, 0, no, 0], function (err, rows) {
		if (err) {
			console.log(JSON.stringify(err));
			return;
		}
		res.send(JSON.stringify(rows));
	});
})

// 這裡應該是放在user下 

router.get("/myArticle/new", function(req, res) {
	res.render('./article/article_create.ejs')	
})


module.exports = router;