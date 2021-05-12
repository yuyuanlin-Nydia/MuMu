var express = require("express");
var app = express();
var bp = require("body-parser");
app.use(bp.json());
var router = express.Router();
var connection = require("../db");


let sql = `
SELECT activityId,activityTitle,upDated,activityContent FROM activityInfo ORDER BY upDated DESC limit 0,5;
SELECT bandName,bandFile,bandId FROM bandinfo limit 0,5;
SELECT  articleId,articleFile,articleTime,articleTitle,articleContent from articleInfo where articleDelete=0 ORDER BY articleTime DESC limit 0,4;
SELECT activityTitle,upDated,activityFile,activityId FROM activityInfo where activityId in (9,2,10) ;
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
			
			connection.query('INSERT INTO `userband` (`userId`,`bandId`) VALUES (?,?)',
			[req.body.userId,parseInt(req.body.bandId)],
			function (error, rows) {
			if (error) console.log(error)
			res.send("收藏成功")})
		}else{
			
			connection.query('DELETE FROM `userband` WHERE ( `userId` = ? AND `bandId` = ? )',
			[req.body.userId,parseInt(req.body.bandId)],
			function (error, rows) {
			if (error) console.log(error)
			res.send("取消收藏")})
		}
	})

})

module.exports = router;