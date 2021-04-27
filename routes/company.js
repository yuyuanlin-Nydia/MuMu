var express = require("express");
var router = express.Router();
var conn = require("../db");
const multer = require('multer');

router.get("/", function (req, res) {
	// select activityFile, companyName, activityTitle, sellDate, performDate from companyinfo inner join activityinfo on companyinfo.companyid = activityinfo.companyid where companyinfo.companyid = 3;
	conn.query('select * from companyinfo inner join activityinfo on companyinfo.companyid = activityinfo.companyid where companyinfo.companyid = 3;',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./company/company_mainPage.ejs', {
				// data: JSON.stringify(rows)
				data: rows
			});
		}
	);

})



router.get("/edit", function (req, res) {
	conn.query('select * from companyinfo inner join activityinfo on companyinfo.companyid = activityinfo.companyid where companyinfo.companyid = 3;',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./company/company_edit.ejs', {
				// data: JSON.stringify(rows)
				data: rows
			});
		}
	);
	// res.render('./company/company_edit.ejs')

});
router.get("/myArticle", function (req, res) {
	
	res.redirect('/company')

});
// router.post("/edit", function (req, res) {
	
	

// });



module.exports = router;