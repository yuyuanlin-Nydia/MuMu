var express = require("express");
var router = express.Router();
var conn = require("../db");

router.get("/", function (req, res) {

	conn.query('select * from activityinfo',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./log/login.html')
		}
	);

})
router.get("/company", function (req, res) {

			res.render('./log/loginCompany.html')
})
module.exports = router;