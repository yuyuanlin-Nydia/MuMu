var express = require("express");
var router = express.Router();
var conn = require("../db");


// 路徑id = 1 幾就跳轉到第一頁


router.get("/:id", function(req, res) {
        let sql = `SELECT * from bandinfo where bandId=?;
SELECT * from bandAlbum where bandId=?;
SELECT * from activityBand INNER JOIN activityInfo ON(activityBand.activityId =activityInfo.activityId ) where bandId =?;

`
        conn.query(sql, [req.params.id, req.params.id, req.params.id], function(error, rows) {
            if (error) {
                console.log(error);
            }
            var data = rows;
            res.render('./band/band_single.ejs', {
                data: data[0][0],
                data2: data[1],
                data3: data[2]


            });
        })
    })
    // 總樂團介紹列表

router.get("/", function(req, res) {
    var sql = 'SELECT * from bandinfo'
    conn.query(sql, function(error, rows) {
        // conn.query(sql,function(error,rows){

        // })
        if (error) {
            console.log(error);
        }
        var data = rows;
        res.render('./band/band__all.ejs', {
            data: data


        });
    })
})





// 移除收藏POST
router.post('/movelove', function(req, res) {
        var body = req.body;
        var sql = `Delete from useractivity where activityId = ? and userId=3;`
        var data = [parseInt(body.activityId)];
        // console.log("move");
        // console.log(data);
        connection.query(sql, data, function(error, results, fields) {
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
    // 加入收藏POST
router.post('/addlove', function(req, res) {
    var body = req.body;
    var sql = `INSERT INTO useractivity(activityId,userId)VALUES (?, ?);`
    var data = [parseInt(body.activityId), 3];
    // console.log("add");
    // console.log(data);
    connection.query(sql, data, function(error, results, fields) {
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






module.exports = router