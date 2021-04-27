var express = require("express");
var router = express.Router();
// var conn = require("../db");
// 依 HTTP 的 Method (POST/GET/PUT/DELETE) 進行增查修刪
var { Success, Error } = require('./response')
var connection = require("../db");

var sql = `
SELECT * FROM activityInfo;`
// SELECT bandName,bandfile FROM bandinfo;
// SELECT  articleFile,articleTime,articleTitle from articleInfo

// //跳轉到有頁數的路由
router.get('/', function(req, res){
    res.redirect('/activity/1')
})

router.get("/:page([0-9]+)", function (req, res) {
    
    var page = req.params.page
    //把<=0的id強制改成1
    if(page <= 0 ) {
        res.redirect('/activity/1')
        return
    }
    //每頁資料數
    var nums_per_page = 3
    //定義資料偏移量
    var offset = (page - 1) * nums_per_page
    
    sql = `SELECT * FROM activityInfo LIMIT ${offset}, ${nums_per_page};`
    connection.query(sql,[], function (error, rows) {
        connection.query(`SELECT COUNT(*) AS COUNT FROM activityInfo;`,[], function (error, nums) {

            var last_page = Math.ceil(nums[0].COUNT / nums_per_page)

            //避免請求超過最大頁數
            if(page > last_page) {
                res.redirect('/'+last_page)
                return
            }
            res.render('./activity/activity_all.ejs',{
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
    sql = `select activityTitle,activityFile,activityContent,activityLocation,city,town,activityAddress,ticketAmount,p.categoryId,type,unitPrice,sellDate,companyName 
    from  (activityinfo i INNER JOIN  activityprice p ON (i.activityId = p.activityId)) 
    INNER JOIN companyinfo c ON(i.companyId = c.companyId)
    INNER JOIN area a ON(i.areaId =a.areaId)
    INNER JOIN district d ON(a.districtId=d.districtId)
    INNER JOIN activityticketcategory pc ON(p.categoryId=pc.categoryId) 
    where (i.activityId=?);`

    connection.query(sql, [req.params.id], function (error, rows) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_single.ejs', {
            data: rows,
            id: req.params.id
        });
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
router.get('/edit/:aid([0-9]+)', function(req, res){
    sql = `SELECT * FROM activityinfo WHERE activityId = ?`
    activityId = req.params.aid

    connection.query(sql,[activityId], function (error, rows) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_edit.ejs', {
            data: rows,
        });
    })
})
// 企業的活動畫面get
router.get('/text', function(req, res){
    sql = `SELECT * FROM activityinfo WHERE companyId = 5`


    connection.query(sql, function (error, rows) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/text.ejs', {
            data: rows,
        });
    })
})


// 搜尋get
// router.get('/:search', function(req, res){
//     sql = `SELECT * FROM activityinfo WHERE activityTitle LIKE "%"?"%"`
//     search = req.params.search

//     connection.query(sql,[search], function (error, rows) {
//         if (error) {
//             console.log(error);
//         }
//         res.render('./activity/activity_all.ejs', {
//             data: rows,
//         });
//     })
//     // var sql =`SELECT * FROM activityinfo WHERE activityTitle LIKE "%?%"`
//     // var data = [body.search]
//     // console.log(req.body)
//     // connection.query(sql,[data],function (error,results,fields) {
//     //     if(results){
//     //         res.end(
//     //             JSON.stringify(new Success('insert success'))
//     //         )
//     //     } else {
//     //         res.end(
//     //             JSON.stringify(new Error('insert failed'))
//     //         )
//     //     }


//     // })
// })
// 搜尋POST
router.post('/search', function(req, res){
    var body = req.body
    var sql =`SELECT * FROM activityinfo WHERE activityTitle LIKE "%?%"`
    var data = [body.search]
    // console.log(req.body)
    connection.query(sql,[data],function (error,results,fields) {
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


// 新增活動/刪除POST
router.post('/update', function(req, res){
    var body = req.body;
    
    var sql =`INSERT INTO activityinfo(companyId, activityTitle, activityFile,activityContent,activityLocation, areaId,activityAddress,sellDate,performDate,ticketAmount)VALUES 
(?, ?, ?, ?, ?, ?,?,?,?,?);`
    var data = [5, body.activityTitle, body.activityFile, body.activityContent, body.activityLocation,  body.areaId, body.activityAddress, body.sellDate, body.performDate, parseInt(body.ticketAmount)];
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
router.post('/delete', function(req, res){
    var body = req.body;
    
    var sql =`Delete from activityinfo where activityId = ?`
    var data = [parseInt(body.activityId)];
    var data2 = [10];

    
    
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
// 編輯活動POST
// UPDATE activityinfo SET companyId=5,activityTitle='aaa' WHERE activityId= 12
router.post('/edit', function(req, res){
    var body = req.body;
    
    var sql =`UPDATE activityinfo SET companyId=?, activityTitle=?, activityFile=?,activityContent=?,activityLocation=?, areaId=?,activityAddress=?,sellDate=?,performDate=?,ticketAmount=? 
    WHERE activityId= ?;`
    var data = [2, body.activityTitle, body.activityFile, body.activityContent, body.activityLocation,  body.areaId, body.activityAddress, body.sellDate, body.performDate, parseInt(body.ticketAmount)];
    // console.log(data);
    
    
    // connection.query(sql,data,function (error,results,fields) {
    //     if(results){
    //         res.end(
    //             JSON.stringify(new Success('insert success'))
    //         )
    //     } else {
    //         res.end(
    //             JSON.stringify(new Error('insert failed'))
    //         )
    //     }
    // })
})
module.exports = router;

