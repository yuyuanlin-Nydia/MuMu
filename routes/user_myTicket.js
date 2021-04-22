const { render } = require("art-template");
var express = require("express");
var myticket = express.Router()
var conn = require('../db')

// var { Success, Error } = require('../response')

// 我的票券SELECT第一列未過期,第二列過期票(userId=1)
myticket.get('/', function (req, res) {
    conn.query(`select * from activitydetails INNER JOIN useractivity on (activitydetails.activityId=useractivity.activityId) where ( (activitydetails.activityDate >= NOW()) AND (useractivity.userId=?) );
                select * from activitydetails INNER JOIN useractivity on (activitydetails.activityId=useractivity.activityId) where ( (activitydetails.activityDate < NOW()) AND (useractivity.userId=?) );`,
        [1, 1],
        function (err, rows) {
            if (err) {
                res.send('err')
            }
            res.send(JSON.stringify(rows));

        }
    )
})

module.exports =myticket ;