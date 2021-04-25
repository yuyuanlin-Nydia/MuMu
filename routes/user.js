var express = require("express");
var router = express.Router();
var conn = require("../db");




//會員頁-票券
router.get("/", function (req, res) {
	conn.query('select * from orders',
		'',
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
    
			res.render('./user/user_myTicket.html')
    }
	
	);
})
//票券
router.get("/ticket", function (req, res) {
	
			res.redirect('/user')
    
})

// 票券data
router.get("/ticket/data", function(req, res) {
conn.query('select * from orders where userId = 1',
'',
function (err, Pdata) {
    if (err) {
        console.log(JSON.stringify(err));
        return;
    }

res.send(JSON.stringify(Pdata));
});
})


//我的投稿(心得)
router.get("/myArticle", function(req, res) {
   
    
        res.render('./user/user_myArticle.html')

})
//我的投稿data
router.get("/myArticle/data", function(req, res) {
    conn.query('select * from articleinfo where userId = 1',
    '',
    function (err, Pdata) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
   
    res.send(JSON.stringify(Pdata));
});
})



////發表心得

//收藏活動樂團
router.get("/favorite", function(req, res) {

    res.render('./user/user_myFavorite.ejs')

})
//收藏data
router.get("/favorite/band", function(req, res) {
    conn.query('select * from userband where userId = 1',
    // userAccount ="abc123"
    '',
    function (err, Pdata) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
   
    res.send(JSON.stringify(Pdata));
});
})

//活動data
router.get("/favorite/event", function(req, res) {
    conn.query('select * from userband where userId = 1',
    // 改成join userAccount =?
    '',
    function (err, Pdata) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
   
    res.send(JSON.stringify(Pdata));
});
})



//// 移除追蹤樂團
router.post("/favorite/band", function (request, response) {

	connection.query(
		"delete from userband where bandId = " + request.body.bandId +' and useraccount = "abc123"',
			[]
		);
	response.send("row deleted.");
    
})


//移除收藏活動
router.post("/favorite/event", function (request, response) {

	connection.query(
		"delete from useractivity where activityId = " + request.body.activityId + ' and useraccount = "abc123"',
			[]
		);
	response.send("row deleted.");
    
})


//個人資料
router.get("/profile", function(req, res) {
    
    res.render('./user/user_edit.ejs')
    // res.send(JSON.stringify(Pdata));
});


// profile資料data
router.get("/profile/data", function(req, res) {
    conn.query('select * from userinfo',
    '',
    function (err, Pdata) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
   
    res.send(JSON.stringify(Pdata));
});
})

// 編輯個人資料
// router.put("/profile/data", function (req, res) {

// 	connection.query(
// 		"update userinfo set userEmail = ?, userPhone = ? where userId = " 
// 		    + request.body.userId, 
// 			[
// 				request.body.userEmail, 
// 				request.body.userPhone
// 			]);
// 	response.send("row updated.");
    
// })


// 上傳大頭貼
// "update userinfo set userFile = ? where userId = " 


module.exports = router;