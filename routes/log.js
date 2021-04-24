var express = require("express");
var router = express.Router();
var conn = require("../db");

router.get("/", function (req, res) {

	
			res.render('./log/loginPre.html')
	
})
router.get("/login", function (req, res) {

	res.render('./log/login.html')
})
router.get("/companyLogin", function (req, res) {

			res.render('./log/loginCompany.html')
})
module.exports = router;