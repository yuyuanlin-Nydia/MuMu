var express = require("express");
var cart = express.Router()
var conn = require('../db')



// 1.建購物車資料表,暫存購物車,要有圖片
// 2.我的優惠卷
// 3.購票訂單邊號
//4.信用卡資訊
//5.紙本或電子票
//6.我的票卷/我的活動,新增活動圖




// var { Success, Error } = require('../response')

// 新增訂單
// cart0.post("/cart0", function (req, res) {
// 	db.query(`insert into  orders (userid,orderDate)values(?,CURDATE());
//     insert into  orderdetails(orderId,activityId,categoryId,unitPrice,quantity)values((select max(orderId) from orders),(select activityId from activityinfo where activityTitle =?),?,(select activityprice.unitPrice from activityprice INNER JOIN activityinfo ON activityprice.activityId =activityinfo.activityId where activityinfo.activityTitle=? AND activityprice.categoryId=? ),?);`
//   ,
// 		[],
// 		function (err, rows) {
// 			if (err) {
// 				console.log(JSON.stringify(err));
// 				return;
// 			}
// 			// res.send(JSON.stringify(rows));
// 			res.render('')
// 		}
// 	);

// })







// cart.post('/addcart', function (req, res) {
//     conn.query(`insert into  orders (userId,orderdata) values (?,DATE())`,
//         [],
//         function (err, rows) {
//             if (err) {
//                 console.log(JSON.stringify(err));
//                 return;
//             } 
//             // res.send(JSON.stringify(rows));
//             res.render(rows)
//         }
//     );
// })



cart.get('/', function (req, res) {
    conn.query(`select * from orders ;
           select * from orderdetails;`,
        [],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.send(JSON.stringify(rows));

        }
    );
})

// car0頁取得總數以及訂購總金額()
cart.get("/cart0getmoney", function (req, res) {
    var sql = conn.query(`select sum(categoryId*quantity),sum(categoryId*unitPrice*
        quantity) from orderdetails INNER JOIN orders on
        ( orderdetails.orderId =orders.orderId )where
        (orders.userId=? AND orders.orderId=?)`,
        [1, 1],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.send(JSON.stringify(rows));
            // res.render('./activity/cart0.html')
        }
    );
})
// car0頁寫入訂單
cart.get('/cart0orderdetail', function (req, res) {
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


// 使用優惠卷





// cart1寫入信用卡
cart.post('/cart1form', function (req, res) {
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
cart.get('/cart2check', function (req, res) {
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


module.exports = cart;