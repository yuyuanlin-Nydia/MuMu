var express = require("express");
var router = express.Router();
var conn = require("../db");

// router.get("/", function(req, res) {

//     conn.query('select * from bandinfo',
//         '',
//         function(err, rows) {
//             if (err) {
//                 console.log(JSON.stringify(err));
//                 return;
//             }

//             ;

//             res.render('./band/band_single.ejs', {
//                 data: JSON.stringify(rows)
//             });
//         }

//     );

// })
let sql = 'SELECT * from bandinfo'
router.get("/", function(req, res) {
    conn.query(sql, function(error, rows) {
        if (error) {
            console.log(error);
        }

        res.render('./band/band_single.ejs', {
            data: JSON.stringify(rows)
        });
    })
})





module.exports = router