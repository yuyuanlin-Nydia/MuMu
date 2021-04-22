var express = require("express");
var router = express.Router();
var conn = require("../db");

router.get("/", function (req, res) {
	
	conn.query('select activityFile, companyName, activityTitle, sellDate, performDate from activityinfo inner join companyinfo on activityinfo.companyid = companyinfo.companyid',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			// res.send(JSON.stringify(rows));
			res.render('./company/company_mainPage.html')
		}
	);

})
router.get("/", function(req, res) {
    res.redirect("/1") //如果後面沒有指定數字 就到編號1的文章
})

// 企業會員-投稿
router.get("/:id", function(req, res) {
    conn.connect(function(err) {
            // res.send(JSON.stringify(err));
        })
        //傳達指令
    conn.query("select activityFile, companyName, activityTitle, sellDate, performDate from activityinfo inner join companyinfo on activityinfo.companyid = companyinfo.companyid WHERE activityinfo.companyid = ?", [req.params.id], function(err, result) {
            res.send(JSON.stringify(result));
        })

})
// 企業會員-編輯
// router.put("/", function (req, res) {
// 	conn.query('update companyinfo set areaId=? where companyId=?',
// 	[],
// 	function(err,result){
// 		res.send('row updated')
// 	})
	
// });


module.exports = router;