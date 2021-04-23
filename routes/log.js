var express = require("express");
var router = express.Router();
var conn = require("../db");

router.get("/", function (req, res) {

	
			res.render('./log/login.html')
	
})
router.get("/company", function (req, res) {

			res.render('./log/loginCompany.html')
})
module.exports = router;