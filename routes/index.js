var express = require("express");
var router = express.Router();
var connection = require("../db");

let sql = `
SELECT activityTitle,performDate FROM activityInfo;
SELECT bandName,bandfile FROM bandinfo;
SELECT  articleFile,articleTime,articleTitle from articleInfo
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
