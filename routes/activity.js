var express = require("express");
var router = express.Router();
// var conn = require("../db");
// 依 HTTP 的 Method (POST/GET/PUT/DELETE) 進行增查修刪
var { Success, Error } = require('./response')
const multer = require('multer');
const url = require('url');
const querystring = require('querystring');
var connection = require("../db");

var sql = `
SELECT * FROM activityInfo;`

// //跳轉到有頁數的路由
router.get('/', function (req, res) {
    res.redirect('/activity/1')
})

router.get("/:page([0-9]+)", function (req, res) {

    var page = req.params.page
    //把<=0的id強制改成1
    if (page <= 0) {
        res.redirect('/activity/1')
        return
    }
    //每頁資料數
    var nums_per_page = 3
    //定義資料偏移量
    var offset = (page - 1) * nums_per_page

    sql = `SELECT a.activityId,companyName,activityTitle,activityFile,activityLocation,sellDate FROM activityinfo a INNER JOIN companyinfo c on(a.companyId=c.companyId) ORDER BY activityId DESC LIMIT ${offset}, ${nums_per_page};`
    connection.query(sql, [], function (error, rows) {
        connection.query(`SELECT COUNT(*) AS COUNT FROM activityInfo;`, [], function (error, nums) {

            var last_page = Math.ceil(nums[0].COUNT / nums_per_page)
            // console.log(typeof(rows));


            //避免請求超過最大頁數
            if (page > last_page) {
                res.redirect('/' + last_page)
                return
            }
            res.render('./activity/activity_all.ejs', {
                //typeof(rows)=object
                data: rows,
                curr_page: page,
                //每頁資料數
                nums_per_page: nums_per_page,
                //本頁資料數量
                total_nums: nums[0].COUNT,
                //總數除以每頁筆數，再無條件取整數
                last_page: last_page


            })

        })

    })

})
// 活動詳細頁get
router.get("/single/:id([0-9]+)", function (req, res) {
    var sql = `select activityTitle,activityFile,activityContent,activityLocation,city,town,activityAddress,ticketAmount,p.categoryId,type,unitPrice,sellDate,WEEKDAY(performDate) as perform,WEEKDAY(sellDate)as sell,companyName 
    from  (activityinfo i INNER JOIN  activityprice p ON (i.activityId = p.activityId)) 
    INNER JOIN companyinfo c ON(i.companyId = c.companyId)
    INNER JOIN area a ON(i.areaId =a.areaId)
    INNER JOIN district d ON(a.districtId=d.districtId)
    INNER JOIN activityticketcategory pc ON(p.categoryId=pc.categoryId) 
    where (i.activityId=?);
    SELECT activityDetailId, activityDate, WEEKDAY(activityDate)as acd,activityDetailId FROM activitydetails WHERE activityId =?;
    SELECT bandName FROM activityband a INNER JOIN bandinfo b ON(a.bandId=b.bandId) WHERE activityId = ?`

    var monthDay = ["一", "二", "三", "四", "五", "六", "日"]
    function dateString(e) {
        var mmddyy = new Date(e);
        var date = mmddyy.getFullYear().toString() + "/" + (mmddyy.getMonth() + 1).toString() + "/" + mmddyy.getDate().toString();
        return date;
    }

    
    connection.query(sql, [req.params.id,req.params.id,req.params.id], function (error, rows) {
        if (error) {
            console.log(error);
        }
        // console.log(rows[0]);
        connection.query(`SELECT activityId FROM useractivity WHERE userId =?`, [3], function (error, favorates) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_single.ejs', {
            data: rows[0],
            activity_day:rows[1],
            band: rows[2],
            // activity_date_one:dateString(rows[1][0].activityDate)+"("+monthDay[rows[1][0].acd]+")",
            // activity_date_two:dateString(rows[1][1].activityDate)+"("+monthDay[rows[1][1].acd]+")",
            id: req.params.id,
            sell_week: monthDay[rows[0][0].sell],
            sell_date: dateString(rows[0][0].sellDate),
            // 收藏的活動
            favorates:favorates,
            activityId:req.params.id
        });
        })
        

    })
})

// 創建新活動畫面get
router.get("/create", function (req, res) {
    sql = `SELECT * FROM activityInfo;`
    connection.query(sql, function (error, rows) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_create.ejs', {
            data: rows
        });
    })

})
// 編輯活動畫面get
router.get('/edit/:aid([0-9]+)', function (req, res) {

    sql =`SELECT activityTitle,activityContent,activityLocation,areaId,activityAddress,categoryId,unitPrice,ticketAmount FROM activityinfo i INNER JOIN activityprice p ON (i.activityId=p.activityId)WHERE i.activityId =?`
    activityId = req.params.aid
    connection.query(sql, [activityId], function (error, rows) {

        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_edit.ejs', {
            data: rows,
            activityId:req.params.aid
        });
    })
})
// router.get('/:search', function (req, res)
// 搜尋get
router.get('/search', function (req, res) {

    search = JSON.stringify("%"+req.query.text+"%");

    var all = `SELECT activityId,companyName,activityTitle,activityFile,districtId,activityLocation,sellDate FROM activityinfo a INNER JOIN companyinfo c on (a.companyId=c.companyId) INNER JOIN area r on (a.areaId=r.areaId) WHERE activityTitle LIKE ${search};`
    var north = `SELECT activityId,companyName,activityTitle,activityFile,districtId,activityLocation,sellDate FROM activityinfo a INNER JOIN companyinfo c on (a.companyId=c.companyId) INNER JOIN area r on (a.areaId=r.areaId) WHERE (districtId BETWEEN 1 AND 6) AND activityTitle LIKE ${search};`
    var middle = `SELECT activityId,companyName,activityTitle,activityFile,districtId,activityLocation,sellDate FROM activityinfo a INNER JOIN companyinfo c on (a.companyId=c.companyId) INNER JOIN area r on (a.areaId=r.areaId) WHERE (districtId BETWEEN 7 AND 11) AND activityTitle LIKE ${search};`
    var south = `SELECT activityId,companyName,activityTitle,activityFile,districtId,activityLocation,sellDate FROM activityinfo a INNER JOIN companyinfo c on (a.companyId=c.companyId) INNER JOIN area r on (a.areaId=r.areaId) WHERE (districtId BETWEEN 12 AND 15) AND activityTitle LIKE ${search};`
    
    districtId =parseInt(req.query.districtId) ;

    switch (districtId) {
        case 1:
            sql=all;
            break;
        case 2:
            sql=north;
            break;
        case 3:
            sql=middle;
            break;     
        default:
            sql=south;
            break;
    }
    
    // console.log(sql);

    connection.query(sql, function (error, rows) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_all.ejs', {
            data: rows,
            nums_per_page: 1,
            total_nums: 1,
            last_page: 2,
            search:search,
            districtId:districtId
        });
    })

})
// 搜尋POST
router.post('/search', function (req, res) {
    var body = req.body
    var sql = `SELECT * FROM activityinfo WHERE activityTitle LIKE "%?%"`
    var data = [body.search]
    // console.log(req.body)
    connection.query(sql, [data], function (error, results, fields) {
        if (results) {
            res.end(
                JSON.stringify(new Success('insert success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('insert failed'))
            )
        }


    })

})


// 新增活動/刪除POST
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 新增活動後不會發生跳轉的BUG!!
// ----------已解決-----------
router.post('/update', function (req, res) {
    var body = req.body;

    var sql = `INSERT INTO activityinfo(companyId, activityTitle, activityFile,activityContent,activityLocation, areaId,activityAddress,sellDate,performDate,ticketAmount)VALUES 
(?, ?, ?, ?, ?, ?,?,?,?,?);`
    var data = [5, body.activityTitle, body.activityFile, body.activityContent, body.activityLocation, body.areaId, body.activityAddress, body.sellDate, body.performDate, parseInt(body.ticketAmount)];

    connection.query(sql,data, function (error, results, fields) {
        if (results) {
            res.end(
                JSON.stringify(new Success('insert success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('insert failed'))
            )
        }
        connection.query(`SELECT activityId FROM activityinfo ORDER BY activityId DESC LIMIT 1`, function (error, aid, fields) {

                        var aid = aid[0].activityId;
            
                        // 轉換bandId的url指令數量
                        var sql2 = unHappy(body.bandId);
            
                        function unHappy(data) {
                            var result = ``;
                            for (index in data) {
                                result += `INSERT INTO activityband(activityId, bandId)VALUES (${aid},${data[index]});`
                            }
                            result += `INSERT INTO activitydetails(activityId, activityDate)VALUES (${aid},?);INSERT INTO activitydetails(activityId, activityDate)VALUES (${aid},?);INSERT INTO activityprice(activityId, categoryId,unitPrice)VALUES (${aid},1,?);INSERT INTO activityprice(activityId, categoryId,unitPrice)VALUES (${aid},2,?);`
                            return(result)
                        }
            
                        var data2 =[ body.activityDate1,body.activityDate2, parseInt(body.unitPrice1), parseInt(body.unitPrice2)]
                        connection.query(sql2, data2, function (error, results2, fields) {
                            
                        })
            
                    })

    })
})


// 刪除活動POST
router.post('/delete', function (req, res) {
    var body = req.body;
    var data = parseInt(body.activityId);

    var sql = `Delete from activityband where activityId = ${data};
    Delete from activitydetails where activityId = ${data};
    Delete from activityinfo where activityId = ${data};
    Delete from activityprice where activityId = ${data};`

    connection.query(sql, function (error, results, fields) {
        if (results) {
            res.end(
                JSON.stringify(new Success('insert success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('insert failed'))
            )
        }
    })
})
// 編輯活動POST
// UPDATE activityprice SET unitPrice =500 WHERE categoryId= 1 AND activityId =34;
// UPDATE activityprice SET unitPrice =500 WHERE categoryId= 2 AND activityId =34;
router.post('/edit', function (req, res) {
    var body = req.body;

    var sql = `UPDATE activityinfo SET  activityTitle=?,activityContent=?,activityLocation=?, areaId=?,activityAddress=?,ticketAmount=? WHERE activityId= ?;
    UPDATE activityprice SET unitPrice =? WHERE categoryId= 1 AND activityId =?;
    UPDATE activityprice SET unitPrice =? WHERE categoryId= 2 AND activityId =?;`
    
    
    var data = [body.activityTitle, body.activityContent, body.activityLocation, parseInt(body.areaId), body.activityAddress,parseInt(body.ticketAmount),parseInt(body.activityId),parseInt(body.unitPrice1),parseInt(body.activityId),parseInt(body.unitPrice2),parseInt(body.activityId)];
    // console.log(data);


    connection.query(sql,data,function (error,results,fields) {
        if(results){
            res.end(
                JSON.stringify(new Success('insert success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('insert failed'))
            )
        }
    })
})
// 移除收藏POST
router.post('/movelove', function (req, res){
    var body = req.body;
    var sql =`Delete from useractivity where activityId = ? and userId=3;`
    var data = [parseInt(body.activityId)];
    // console.log("move");
    // console.log(data);
    connection.query(sql,data,function (error,results,fields) {
        if(results){
            res.end(
                JSON.stringify(new Success('insert success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('insert failed'))
            )
        }
    })

})
// 加入收藏POST
router.post('/addlove', function (req, res){
    var body = req.body;
    var sql =`INSERT INTO useractivity(activityId,userId)VALUES (?, ?);`
    var data = [parseInt(body.activityId),3];
    // console.log("add");
    // console.log(data);
    connection.query(sql,data,function (error,results,fields) {
        if(results){
            res.end(
                JSON.stringify(new Success('insert success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('insert failed'))
            )
        }
    })

})

//上傳圖片
var myStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/image/upload/activity"); // 保存的路徑 (需先自己創建)
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

router.post('/upload/file', upload.array('file', 1), function (req, res, next) {
    res.send("上傳成功");
});

module.exports = router;
