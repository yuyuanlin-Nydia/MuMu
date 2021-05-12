var express = require("express");
var router = express.Router();
const multer = require('multer');
var conn = require("../db");
var { login_render, login_api } = require('./middleware/iflogin')
var { Success, Error } = require('./response')


//會員頁-票券
// 會有兩個sql語句 一個是未參加 一個是沒參加
router.get("/", login_render, function (req, res) {

    var account = req.session.userinfo.account;
    var sql = `SELECT ui.userFile,orders.orderId,ai.activityTitle,ai.activityLocation,d.city,a.town,ai.activityAddress,ad.activityDate,ap.unitPrice,od.quantity,od.quantity*ap.unitPrice as tot,atc.type,orders.orderDate,orders.card1,orders.card2,orders.card3,orders.card4,tp.method FROM orderdetails as od 
    inner join orders on orders.orderId=od.orderId
    inner join activityinfo as ai on ai.activityId=od.activityId 
    inner join area as a on ai.areaId=a.areaId
    inner join district as d on a.districtId=d.districtId
    inner join activityticketcategory as atc on atc.categoryId=od.categoryId 
    inner join userinfo as ui on ui.userId=orders.userId
    inner join ticketpickup as tp on tp.ticketpickupId=orders.ticketpickupId
    inner join activitydetails as ad on ad.activityDetailId=od.activityDetailId
    inner join activityPrice as ap on ap.activityId=od.activityId and ap.categoryId=atc.categoryId
    where ui.userAccount=? and ad.activityDate> NOW() order by orders.orderDate DESC;
    
    SELECT orders.orderId,ai.activityTitle,ai.activityLocation,d.city,a.town,ai.activityAddress,ad.activityDate,ap.unitPrice,od.quantity,od.quantity*ap.unitPrice as tot,atc.type,orders.orderDate,orders.card1,orders.card2,orders.card3,orders.card4,tp.method FROM orderdetails as od 
    inner join orders on orders.orderId=od.orderId
    inner join activityinfo as ai on ai.activityId=od.activityId 
    inner join area as a on ai.areaId=a.areaId
    inner join district as d on a.districtId=d.districtId
    inner join activityticketcategory as atc on atc.categoryId=od.categoryId 
    inner join userinfo as ui on ui.userId=orders.userId
    inner join ticketpickup as tp on tp.ticketpickupId=orders.ticketpickupId
    inner join activitydetails as ad on ad.activityDetailId=od.activityDetailId
    inner join activityPrice as ap on ap.activityId=od.activityId and ap.categoryId=atc.categoryId
    where ui.userAccount=? and ad.activityDate< NOW() order by orders.orderDate DESC;
    SELECT ui.userId,ui.firstName,ui.userAccount,ui.userFile FROM userinfo ui WHERE userAccount=?`
    conn.query(sql,
        [account, account, account],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }

            res.render('./user/user_myTicket.ejs', {
                data: rows[0],
                data2: rows[1],
                data3: rows[2],
                Name: req.session.userinfo.name,
                avatar: req.session.userinfo.avatar,


            })
        }

    );
})
//票券
router.get("/ticket", function (req, res) {
    res.redirect('/user')
})

//我的投稿(心得)
router.get("/myArticle", login_api, function (req, res) {
    var session = req.session.userinfo;
    conn.query(`select * from articleinfo  join userInfo on userInfo.userId=articleinfo.userId 
    where userAccount = ? and articleDelete=0 order by articleId DESC;
    SELECT ui.userId,ui.firstName,ui.userAccount,ui.userFile FROM userinfo ui WHERE userAccount=?`,
        [session.account, session.account],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render('./user/user_myArticle.ejs', {
                data: rows,
                account: session.account,
                Name: session.name,
                phone: session.phone,
                mail: session.email,
                file: session.file,
                avatar: session.avatar
            })

        })
})
// 發表文章
router.get("/myArticle/new", function (req, res) {
    res.render('./article/article_create.ejs')
})
// 使用者代號記得改
// 上傳文章
router.post("/upload", function (req, res) {
    var account = req.session.userinfo.account;
    var r = req.body;
    var sql=`insert into articleInfo (userId,articleTitle,articleContent,articleTime,articleFile)values ((SELECT userId FROM userinfo WHERE userAccount=?),?,?,?,?)`;
    conn.query(sql,[account,r.title, r.content, new Date(), r.image], 
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
        })
        console.log(req.session.userinfo )
    res.send("successfully add new article");
})
//上傳圖片
var myStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/image/upload/article"); // 保存的路徑 (需先自己創建)
    },

    filename: function (req, file, cb) {
        // 為了預防有重複檔名
        var Today = new Date();
        var date = Today.getFullYear().toString() + (Today.getMonth() + 1).toString().padStart(2, "0") + Today.getDate().toString().padStart(2, "0");
        cb(null, date + '-' + file.originalname); // 自定義檔案名稱
    }
});

var upload = multer({
    storage: myStorage, // 設置 storage
});

router.post('/upload/file', upload.array('file', 3), function (req, res, next) {
    res.send("上傳成功");
});
// 我的心得編輯
router.get("/myArticle/edit/:id", function (req, res) {
    var no = req.params.id
    var sql = `select * from articleinfo  join userInfo on userInfo.userId=articleinfo.userId 
       where userAccount = ? and articleId=?`
    conn.query(sql,
        [req.session.userinfo.account,no ],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render('./user/user_myArticle_edit.ejs', {
                data: rows

            })
        })
})
// 編輯文章後的指令
router.post("/myArticle/edit/success", function (req, res) {
    var sql = `update articleInfo SET articleTitle=?, articleContent=? where articleId=?`
    conn.query(sql, [req.body.title, req.body.content, req.body.id], function (err, rows) {
        if (err) {
            console.log(err)
        };
        res.send("Edit successed.")
    })
})
// 刪除文章的指令
router.delete("/myArticle/delete", function (req, res) {
    var sql = `update articleInfo SET articleDelete=1 where articleId=?`
    conn.query(sql, [req.body.id], function (err, rows) {
        if (err) {
            console.log(err)
        };
        res.send("Edit successed.")
    })
})

//收藏活動+樂團
router.get("/favorite", login_api, function (req, res) {
    var session = req.session.userinfo;
    conn.query(`SELECT userband.bandId,userband.userId,bandinfo.bandName,userinfo.firstName,bandinfo.bandFile,userinfo.userFile FROM userband 
    INNER JOIN  bandinfo ON userband.bandId = bandinfo.bandId
    INNER JOIN  userinfo ON userinfo.userId = userband.userId
    WHERE userinfo.userId=? ;
    SELECT c.userId,d.firstName,a.activityId,activityTitle,activityLocation,activityFile,b.minDate,b.maxDate 
    FROM activityinfo as a 
    INNER JOIN (SELECT activityId,MIN(activityDate)as minDate,MAX(activityDate) as maxDate   
    FROM activitydetails GROUP BY activityId) as b ON(a.activityId=b.activityId)
    INNER JOIN useractivity c on(a.activityId=c.activityId)
    INNER JOIN userinfo as d ON (c.userId=d.userId) WHERE c.userId=?;
    SELECT ui.userId,ui.firstName,ui.userAccount,ui.userFile FROM userinfo ui WHERE userAccount=?`,
        [session.id, session.id, session.account],
        function (err, data) {

            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render('./user/user_myFavorite.ejs', {
                data: data[0], //band
                data2: data[1],//event
                data3: data[2],//avatar
                account: session.account,
                Name: session.name,
                phone: session.phone,
                mail: session.email,
                file: session.file,
                avatar: session.avatar
            })
        })

})

//// 移除追蹤活動
router.delete("/event/delete", function (req, res) {
    var session = req.session.userinfo;
    var aId = req.body.id;
    console.log(aId);
    var sql = `DELETE FROM useractivity WHERE userId=? && activityId=?`
    conn.query(sql, [session.id, aId], function (err, rows) {
        if (err) {
            console.log(err)
        };
        res.send("Edit successed.")
    })
})


//// 移除追蹤樂團
router.delete("/band/delete", function (req, res) {
    var session = req.session.userinfo;
    var aId = req.body.id;
    var sql = `DELETE FROM userband WHERE userId=? && bandId=?`
    conn.query(sql, [session.id, aId], function (err, rows) {
        if (err) {
            console.log(err)
        };
        res.send("Edit successed.")
    })
})

//個人資料
router.get("/profile", login_api, function (req, res) {
    console.log(req.session.userinfo);
    var session = req.session.userinfo;
    conn.query(`SELECT ui.userId,ui.firstName,ui.userAccount,ui.userPassword,ui.userPhone,ui.userEmail,ui.userFile,ui.userArea,ui.userBirth,ui.userAdd,ui.userDis, district.city, area.town FROM userinfo ui
    left JOIN area ON ui.userArea = area.areaId
    left JOIN district ON ui .userDis = district.districtID
    WHERE userId=?;`, [session.id],
        function (err, Pdata) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render('./user/user_edit.ejs', {
                data: Pdata[0],
                userId: session.id,
                Name: session.name,

            });
            console.log(Pdata)
        });



});

//編輯個人資料
router.post("/profile", function (req, res) {
    var session = req.session.userinfo;
    var body = req.body
    var sql = `UPDATE userinfo SET userBirth = ?, userPhone = ?, userEmail = ?, userArea = ?, userDis = ?,userAdd = ? WHERE userId = ?`;
    var data = [body.birth, body.phone, body.e_mail, body.town, body.city, body.address, session.id]
    conn.query(sql, data, function (error, results, fields) {
        if (results) {
            res.end(
                JSON.stringify(new Success('UPDATE success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('UPDATE failed'))
            )
        }

    })

})
//更改密碼
router.post("/profile/pw", function (req, res) {
    var session = req.session.userinfo;
    var body = req.body
    var sql = `UPDATE userinfo SET userPassword = ? WHERE userId = ?`;
    var data = [body.newpw, parseInt(session.id)]
    conn.query(sql, data, function (error, results, fields) {
        if (results) {
            res.end(
                JSON.stringify(new Success('UPDATE success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('UPDATE failed'))
            )
        }
    })

})
//舊密碼確認
router.post('/checkpw', function (req, res) {
    var session = req.session.userinfo;
    var body = req.body;
    var sql = `select userId from userinfo where userPassword=? AND userId=?`
    var data = [body.oldpw, session.id]
    conn.query(sql, data, function (error, results, fields) {
        // console.log(results[0]);
        if (results[0]) {
            res.end(
                JSON.stringify('old password is correct'),
            )
        } else {
            res.end(
                JSON.stringify(new Success('old password is false')),
            )
        }
    })
})


// 上傳大頭貼
// var sql = `UPDATE userinfo SET userFile = ? WHERE userinfo.userId = ?`
router.post("/avatarUpload", function (req, res) {
    var session = req.session.userinfo
    var body = req.body
    conn.query('UPDATE userinfo SET userFile = ? WHERE userinfo.userId = ?',
        [body.image, session.id], function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }

        })
    res.send("successfully update avatar");
})

var myStorage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/image/upload/user"); // 保存的路徑
    },

    filename: function (req, file, cb) {
        // 檔名日期+原檔名
        var Today = new Date();
        var date = Today.getFullYear().toString() + (Today.getMonth() + 1).toString().padStart(2, "0") + Today.getDate().toString().padStart(2, "0");
        cb(null, date + '-' + file.originalname); // 自定義檔案名稱
    }
});

var upload2 = multer({
    storage: myStorage2, // 設置 storage
});


router.post('/upload/avatarfile', upload2.single('file'), function (req, res) {
    res.send("上傳成功");
});
router.post("/district", function (req, res) {
    conn.query('SELECT * from `district`',
        [], function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.send(rows)
        })
})
router.post("/town", function (req, res) {
    conn.query('SELECT town,areaId FROM area INNER join district as d on d.districtId=area.districtId where d.districtId=?',
        [req.body.districtId], function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.send(rows)
        })
})
router.post("/town/user", function (req, res) {
    conn.query('SELECT town,areaId FROM area INNER join district as d on d.districtId=area.districtId where area.districtId=(SELECT userDis from userinfo where userAccount=?)',
        [req.session.userinfo.account,req.body.districtId], function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.send(rows)
        })
})

module.exports = router;