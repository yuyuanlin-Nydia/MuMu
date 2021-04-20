var express = require("express");
var router = express.Router();


router.get("/", function (req, res) {
	var connection = require("../db");


	connection.query('select * from activityinfo',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./index.html')
		}
	);

})



module.exports = router;
