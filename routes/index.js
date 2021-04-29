var express = require("express");
var router = express.Router();
var connection = require("../db");

let sql = `
SELECT activityId,activityTitle,performDate,activityContent FROM activityInfo;
SELECT bandName,bandFile FROM bandinfo limit 0,9;
SELECT  articleId,articleFile,articleTime,articleTitle,articleContent from articleInfo limit 0,4;
SELECT activityTitle,performDate,activityFile,activityId FROM activityInfo limit 0,3;
`
router.get("/", function (req, res) {
	connection.query(sql, function (error, rows) {
		if (error) {
			console.log(error);
		}
		res.render('./index.ejs', {
			data: JSON.stringify(rows)
		});
	})
})

	module.exports = router;