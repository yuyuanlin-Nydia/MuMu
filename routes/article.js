var express = require("express");
var router = express.Router();

var conn = require("../db");


router.get("/", function (req, res) {
	res.redirect("/article/1")
})
// 分頁
router.get('/:page([0-9]+)', function (req, res) {
	var page = req.params.page;
	var count = 9;
	var offset = (page - 1) * count;
	// limit要放最後
	var sql = `SELECT COUNT(*) AS COUNT FROM articleinfo`
	conn.query(sql, [], function (err, result) {
		if (err) { console.log(err); };
		var last_page = Math.ceil((result[0].COUNT) / count)
		var data = result;
		// 	如果超過最大頁數 就到編號1的文章
		if (page > last_page || page < 1) {
			res.redirect("/article/1")
		}
		res.render('./article/article_all.ejs', {
			last_page: last_page,
		})
	});
})
//列表的資料
//第三個語句是為了搜尋功能
router.get('/data/:page', function (req, res) {
	var page = req.params.page;
	var count = 9;
	var offset = (page - 1) * count;
	// limit要放最後
	var sql = `SELECT * FROM articleinfo where articleDelete = ? order by articleTime DESC limit ${offset},${count} ;
	SELECT COUNT(*) AS COUNT FROM articleinfo;
	select * from articleinfo where articleDelete = ?`

	conn.query(sql, [0, 0], function (err, rows) {
		if (err) { console.log(err); };
		var last_page = Math.ceil((rows[1][0].COUNT) / count)
		// 	如果超過最大頁數 就到編號1的文章
		if (page > last_page || page < 1) {
			res.redirect("/article/1")
		}
		res.send(JSON.stringify(rows));
	});
})

// 搜尋
router.post("/search", function (req, res) {
	// 這個方法會變成select * from articleinfo where articleContent LIKE '%"音樂"%' 語法錯誤
	// conn.query("select * from articleinfo where articleContent LIKE '%?%'",

	conn.query("select * from articleinfo where instr(articleContent,?)",
		[req.body.search_text], function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err))
			}
			res.send(JSON.stringify(rows))
		})
})
// 標籤路由
router.get("/search/port", function (req, res) {
	conn.query("select * from articleinfo where articleTitle LIKE '%大港開唱%'",
		[], function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err))
			}
			res.send(JSON.stringify(rows))
		})
})
// 新增評論 要改userId 
router.post("/comment", function (req, res) {
	conn.query("insert into articleComment (articleId,userId,commentContent) VALUES (?,(SELECT userId FROM userinfo WHERE userAccount=?),? )",
		[req.body.index,req.session.userinfo.account, req.body.comment_text]), function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err))
			}
		}
	res.send("row inserted.")
})

// 個別的文章
router.get("/item/:no", function (req, res) {
	var no = req.params.no
	if (no < 0) {
		res.redirect("/item/1");
	}
	res.render('./article/article_single.ejs');
});
// 第四個sql語句 user到時候要去抓session的值
// 這裡有一個狀況是 沒登入要留言 請先登入
// 有登入的話可以直接留言
router.get("/item/data/:no", function (req, res) {
	var no = req.params.no;

	var sql = `select ai.articleId,ai.articleTitle, ai.articleContent,ai.articleTime,ai.articleFile,ui.firstName,ui.userFile from articleinfo as ai join userinfo as ui on ui.userId=ai.userId where articleId=? and articleDelete = ?;
	SELECT ac.commentContent,ac.commentTime,ui.userAccount,ui.userFile  FROM articlecomment as ac
	join userInfo as ui on ui.userId= ac.userId
	where articleId=? and commentDelete=? order by ac.commentTime DESC;
	SELECT COUNT(*) as COUNT from articlecomment where articleId=? and commentDelete=?;
	SELECT userFile from userInfo where userAccount="clock520";
	SELECT count(*) as COUNT from articleinfo where articleDelete = 0 
	`
	conn.query(sql, [no, 0, no, 0, no, 0], function (err, rows) {
		var last_arc = rows[4];
		if (no > last_arc) {
			res.redirect('/' + last_arc)
		}
		if (err) {
			console.log(JSON.stringify(err));
			return;
		}
		res.send(JSON.stringify(rows));
	});
})



module.exports = router;