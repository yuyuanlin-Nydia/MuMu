var express = require("express");
var router = express.Router();
var conn = require("../db");


// 路徑id = 1 幾就跳轉到第一頁

let sql = `SELECT * from bandinfo where bandId=1;
SELECT * from bandAlbum where bandId=1;
SELECT * from activityBand INNER JOIN activityInfo ON(activityBand.activityId =activityInfo.activityId ) where bandId = 1;
SELECT * from bandinfo
`
router.get("/1", function(req, res) {
        conn.query(sql, function(error, rows) {
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
    conn.query(sql, function(error, rows) {
        if (error) {
            console.log(error);
        }
        var data = rows;
        res.render('./band/band__all.ejs', {
            data: data[3]


        });
    })
})










module.exports = router