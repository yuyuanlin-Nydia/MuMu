var express = require("express");
var app = express();
var bp = require("body-parser");
app.use(bp.json());
var router = express.Router();
var connection = require("../db");


let sql = `
SELECT activityId,activityTitle,performDate,activityContent FROM activityInfo ORDER BY performDate;
SELECT bandName,bandFile,bandId FROM bandinfo limit 0,9;
SELECT  articleId,articleFile,articleTime,articleTitle,articleContent from articleInfo where articleDelete=0 limit 0,4;
SELECT activityTitle,performDate,activityFile,activityId FROM activityInfo limit 0,3 ;
SELECT bandId FROM userband WHERE userId = ?;
`
router.get("/", function (req, res) {
	if (req.session.userinfo) {userid = req.session.userinfo.id}
	else {userid = 9999}

	connection.query(sql,[userid], function (error, rows) {
		if (error) {
			console.log(error);
		}
		res.render('./index.ejs', {
			data: JSON.stringify(rows),
			userid: userid
			// bandId_: session.bandId,
		});
	})
})




router.post("/collection",function(req,res){
	connection.query('SELECT * FROM `userband` WHERE ( `userId` = ? AND `bandId` = ? )',
		[req.body.userId,parseInt(req.body.bandId)],
		function (error, rows) {
		if (error) {
			console.log(error);
		}
		if(rows.length == 0) {
			// 找不到的話就 insert into
			connection.query('INSERT INTO `userband` (`userId`,`bandId`) VALUES (?,?)',
			[req.body.userId,parseInt(req.body.bandId)],
			function (error, rows) {
			if (error) console.log(error)
			res.send("收藏成功")})
		}else{
			// 找得到就delete
			connection.query('DELETE FROM `userband` WHERE ( `userId` = ? AND `bandId` = ? )',
			[req.body.userId,parseInt(req.body.bandId)],
			function (error, rows) {
			if (error) console.log(error)
			res.send("取消收藏")})
		}
	})

})

	module.exports = router;