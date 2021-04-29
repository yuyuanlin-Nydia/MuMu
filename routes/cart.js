var express = require("express");
var router = express.Router()
var conn = require('../db')

//1.購物車資料表存放session
//2.我的優惠卷
//3.購票訂單編號
//4.信用卡資訊
//5.紙本或電子票


router.get('/', function (req, res) {
    var sql =`select cart.userId,ai.activityTitle,ai.activityFile,ai.performDate,cart.categoryId,atc.type,cart.quantity,ap.unitPrice from cart 
    INNER JOIN userInfo as ui on( ui.userId =cart.userId) 

    INNER JOIN activityInfo as ai on( ai.activityId =cart.activityId ) 
    INNER JOIN activityPrice ap on( ap.activityId =cart.activityId ) 
    INNER JOIN activityTicketCategory atc on( atc.categoryId =cart.categoryId ) 
    where(ui.userAccount="abc123")`
    conn.query(sql,
        [],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render("./cart/cart.ejs",{
            result:rows
            })
        });
})
router.get('/pay', function (req, res) {
    var sql =`select cart.userId,ai.activityTitle,ai.activityFile,ai.performDate,cart.categoryId,atc.type,cart.quantity,ap.unitPrice from cart 
    INNER JOIN userInfo as ui on( ui.userId =cart.userId) 

    INNER JOIN activityInfo as ai on( ai.activityId =cart.activityId ) 
    INNER JOIN activityPrice ap on( ap.activityId =cart.activityId ) 
    INNER JOIN activityTicketCategory atc on( atc.categoryId =cart.categoryId ) 
    where(ui.userAccount="abc123")`
    conn.query(sql,
        [],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render("./cart/cart_pay.ejs",{
            result:rows
            })
        });
})


// 取得總數以及訂購總金額()
router.get("/cart/details", function (req, res) {
    
    conn.query(sql,
        [1, 1],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.send(JSON.stringify(rows));
        }
    );
})
// car0頁寫入訂單
router.get('/cart0orderdetail', function (req, res) {
    var sql = conn.query(`insert into orderdetails(orderId,activityId,categoryId,unitPrice,quantity)values((select max(orderId) from orders),(select activityId from activityinfo where activityTitle ='赤聲躁動音樂祭'),2,(select activityprice.unitPrice from activityprice INNER JOIN activityinfo ON activityprice.activityId =activityinfo.activityId where activityinfo.activityTitle='赤聲躁動音樂祭' AND activityprice.categoryId=2 ),2)`,
    [],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
           console.log(JSON.stringify(rows));
           res.send(JSON.stringify(rows.insertId));
        }
    );
})

// 這裡放到user底下
router.get("/myTicket", function (req, res) {
    var sql=`select * from orders join orderDetails as odd on odd.orderId=orders.orderId 
    INNER JOIN activityInfo as ai on( ai.activityId =orders.activityId ) 
    where userId=1
    `
    conn.query(sql,
        [],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render("./user/user_myTicket.ejs",{
                result:rows
                })
        }
    );
})





// 使用優惠卷





// cart1寫入信用卡
router.post('/cart1form', function (req, res) {
    var sql = conn.query(`insert into  orders (creditcardnum,ticketeorpaper) values (?,?) `,
        [1234567891234567, '電子票'],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.send(JSON.stringify(rows));
            // res.send("777777777777");
        }
    );
})


//car2顯示結帳頁面(找最新訂單)
router.get('/cart2check', function (req, res) {
    var sql = conn.query(`select * from orders where orderId = (select max(orderId) FROM orders); `,
        [],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            // res.send(JSON.stringify(rows));
            res.send(JSON.stringify(rows));
        }
    );
})


module.exports = router;