var express = require("express");
var router = express.Router();
// var conn = require("../db");
// 依 HTTP 的 Method (POST/GET/PUT/DELETE) 進行增查修刪

var connection = require("../db");

var sql = `
SELECT * FROM activityInfo;`
// SELECT bandName,bandfile FROM bandinfo;
// SELECT  articleFile,articleTime,articleTitle from articleInfo

router.get("/", function (req, res) {
    sql = `SELECT * FROM activityInfo;`
    connection.query(sql, function (error, rows) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_all.ejs', {
            // data: JSON.stringify(rows)
            data: rows
        });
    })

})
router.get("/:id", function (req, res) {
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
router.get("/create", function (req, res) {
    sql = `SELECT * FROM activityInfo;`
    connection.query(sql, function (error, rows) {
        if (error) {
            console.log(error);
        }
        res.render('./activity/activity_create.ejs', {
            data: JSON.stringify(rows)
        });
    })
})

// router.get("/", function (req, res) {

//  conn.query('select * from activityinfo',
//      '',
//      function (err, rows) {
//          if (err) {
//              console.log(JSON.stringify(err));
//              return;
//          }
//          res.send(JSON.stringify(rows));
//          res.render('./activity/activity_all.ejs')
//      }
//  );

// })
// router.get("/single", function (req, res) {

//  conn.query('select * from activityinfo',
//      '',
//      function (err, rows) {
//          if (err) {
//              console.log(JSON.stringify(err));
//              return;
//          }
//          res.send(JSON.stringify(rows));
//          res.render('./activity/activity_single.ejs')
//      }
//  );

// })
router.get("/create", function (req, res) {

    conn.query('select * from activityinfo',
        '',
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            // res.send(JSON.stringify(rows));
            res.render('./activity/activity_create.ejs')
        }
    );

})

// 文章的資料到/data下 去拿
// router.get("/data", function (req, res) {
//  var connection = require("../db");
//  connection.query('select * from activityinfo',
//      [],
//      function (err, rows) {
//          if (err) {
//              console.log(JSON.stringify(err));
//              return;
//          }
//          res.send(JSON.stringify(rows));
//      })
// })

// router.post('/update', function(req, res){
//     var body = req.body
//     // var sql = `UPDATE inventory SET activityTitle = ?, performDate = ?, activityLocation = ?, areaId = ?, activityAddress = ? ticketAmount = ?`;
//  var sql =`INSERT INTO userInfo(activityTitle, performDate, activityLocation,areaId,activityAddress, ticketAmount)VALUES 
//  (?, ?, ?, ?, ?, ?);`

//     var data = [body.activityTitle, body.performDate, body.activityLocation, parseInt(body.areaId), body.activityAddress, parseInt(body.ticketAmount)]
//     db.exec(sql, data, function(results, fields) {
//         if(results.affectedRows){
//             res.end(
//                 JSON.stringify(new Success('update success'))
//             )
//         } else {
//             res.end(
//                 JSON.stringify(new Error('update failed'))
//             )
//         }
//     })
// })


module.exports = router;

