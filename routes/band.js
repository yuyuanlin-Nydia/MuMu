var express = require("express");
var router = express.Router();
var conn = require("../db");
var { Success, Error } = require('./response')


// 路徑id = 1 幾就跳轉到第一頁


router.get("/:id", function(req, res) {
    if (req.session.userinfo) {
        var userId = req.session.userinfo.id;
    }else{
        var userId = '';
    }
    let sql = `SELECT * from bandinfo where bandId=?;
SELECT * from bandAlbum where bandId=?;
SELECT * from activityBand INNER JOIN activityInfo ON(activityBand.activityId =activityInfo.activityId ) where bandId =?;
SELECT * from articleinfo  JOIN bandinfo b
  ON articleinfo.articleContent LIKE CONCAT('%',b.bandName,'%')
  where b.bandId=? and articleDelete =0; `

//   console.log(req.session.userinfo.id);
    conn.query(sql, [req.params.id, req.params.id, req.params.id, req.params.id], function(error, rows) {
        conn.query(`SELECT bandId FROM userband where userId = ?;`,
         [userId], function(err, favorates) {
            if (error) {
                console.log(error);
            }
            var data = rows;
            res.render('./band/band_single.ejs', {
                data: data[0][0],
                data2: data[1],
                data3: data[2],
                data4: data[3],
                favorates: favorates,
                bandId: req.params.id
            });
        })
    })
})
    // 總樂團介紹列表

router.get("/", function(req, res) {
    var sql = 'SELECT * from bandinfo'
    conn.query(sql, function(error, rows) {

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
        var sql = `Delete from userband where bandId = ? and userId=?;`
        var data = [parseInt(req.body.bandId),req.session.userinfo.id];
        // console.log("move");
        // console.log( req.session.userinfo.id);
        conn.query(sql, data, function(error, results, fields) {
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
    var sql = `INSERT INTO userband(bandId,userId)VALUES (?, ?);`
    var data = [parseInt(body.bandId), req.session.userinfo.id];
    conn.query(sql, data, function(error, results, fields) {
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