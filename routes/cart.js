var express = require("express");
var router = express.Router()
var conn = require('../db')

//2.我的優惠卷
//3.購票訂單編號
//5.紙本或電子票

// 查看購票車前須先登入
router.get('/', function (req, res) {
    if (req.session.userinfo) {
        var account = req.session.userinfo.account;
        var sql = `select cart.cartId,cart.userId,cartdetails.cartDetailsId,ai.activityTitle,ai.activityFile,ad.activityDate,ai.activityLocation,ap.unitPrice,atc.type,cartdetails.quantity from cartdetails 
    INNER JOIN cart on( cart.cartId =cartdetails.cartId) 
    INNER JOIN userInfo as ui on( ui.userId =cart.userId) 
    INNER JOIN activityInfo as ai on( ai.activityId =cartdetails.activityId ) 
    INNER JOIN activityPrice ap on( ap.activityId =cartdetails.activityId and ap.categoryId=cartdetails.categoryId) 
	INNER JOIN activityticketcategory atc on( atc.categoryId=cartdetails.categoryId) 
    INNER JOIN activitydetails ad on( ad.activityDetailId=cartdetails.activityDetailId) 
    where(ui.userAccount=? AND cartdetails.quantity>0) order by cartDetailsId DESC;
    select cart.cartId,cart.userId,ai.activityTitle,sum(cartdetails.quantity*ap.unitPrice) as sum from cartdetails 
	INNER JOIN cart on( cart.cartId =cartdetails.cartId)
    INNER JOIN userInfo as ui on( ui.userId =cart.userId) 
    INNER JOIN activityInfo as ai on( ai.activityId =cartdetails.activityId ) 
    INNER JOIN activityPrice ap on( ap.activityId =cartdetails.activityId and ap.categoryId =cartdetails.categoryId) 
    where(ui.userAccount=?);`
    console.log(sql)
        conn.query(sql,
            [account, account],
            function (err, rows) {
                if (err) {
                    console.log(JSON.stringify(err));
                    return;
                }
                res.render("./cart/cart.ejs", {
                    result: rows[0],
                    result2: rows[1]
                })

            }
        );
    } else {
        res.render("./log/loginPre.html")
    }
})
// 活動頁面購票後
// insert IGNORE 是有相同的值不增加  沒有就增加
// 現在是不管選單人票或是選雙人票 都會加入購物車的資料庫
router.post("/", function (req, res) {
    if (req.session.userinfo) {
        var account = req.session.userinfo.account;
        var req = req.body;
        var sql = `insert IGNORE into cart (userId)values((select userId from userInfo where userAccount=?));
    insert into cartdetails (cartId,activityId,activityDetailId,categoryId,quantity)values((SELECT cartId FROM cart where userId=(select userId from userinfo where userAccount=?)),?,?,?,?),((SELECT cartId FROM cart where userId=(select userId from userinfo where userAccount=?)),?,?,?,?)
    `
        conn.query(sql, [account, account, req.activityId, req.activityDetailId, req.categoryId1, req.quantity1,account,  req.activityId, req.activityDetailId, req.categoryId2, req.quantity2],
            function (err, rows) {
                if (err) {
                    console.log(JSON.stringify(err));
                    return;
                }
            })
        res.redirect("/cart")
    } else {
        res.render("./log/loginPre.html")
    }
})
// 刪除購票
router.delete("/", function (req, res) {
    var sql = `delete from cartDetails where cartDetailsId=? `
    conn.query(sql, [req.body.cartId],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.send("item delete.")
        });
})
// 付款頁面
router.get('/pay', function (req, res) {
    var account = req.session.userinfo.account;
    var sql = `select cart.cartId,cart.userId,cd.activityId,cd.activityDetailId,cd.categoryId ,cd.quantity from cartdetails as cd
    INNER JOIN cart on( cart.cartId =cd.cartId) 
    INNER JOIN userInfo as ui on( ui.userId =cart.userId) 
    where(ui.userAccount="abc123");
    select cartId from cart where userId=(select userId from userInfo where userAccount=?);`
    conn.query(sql,
        [account],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render("./cart/cart_pay.ejs", {
                result: rows,
                result2: rows[1]
            })
        });
})


// 按下完成訂票後
router.post("/order", function (req, res) {
    var r = req.body;
    var account = req.session.userinfo.account;
    var sql = `insert into orders (userId,ticketPickupId,card1,card2,card3,card4,month,year)values((select userId from userInfo where userAccount=?),?,?,?,?,?,?,?);
    INSERT INTO orderdetails(orderId,activityId, activitydetailId,categoryId,quantity) SELECT (SELECT max(orderId) from orders),activityId, activitydetailId,categoryId,quantity FROM cartdetails 
    WHERE cartId= (SELECT cartId from cart inner JOIN userinfo as ui on ui.userId=cart.userId WHERE ui.userAccount=?);
    delete from cart where cartId=?;
    delete from cartdetails where cartId=?; 
    `
    console.log(sql);
    conn.query(sql,
        [account,r.ticketPickupId, r.card1, r.card2, r.card3, r.card4, r.month, r.year, account,r.cartId, r.cartId],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
        });
    res.redirect("/cart/finish");
})

//完成付款
router.get("/finish", function (req, res) {
    var account = req.session.userinfo.account;
    var sql = `SELECT orders.orderId,ai.activityTitle,ai.activityLocation,d.city,a.town,ai.activityAddress,ai.performDate,od.quantity,atc.type,orders.orderDate,orders.card1,orders.card2,orders.card3,orders.card4,tp.method FROM orderdetails as od 
    inner join orders on orders.orderId=od.orderId
    inner join activityinfo as ai on ai.activityId=od.activityId
    inner join area as a on ai.areaId=a.areaId
    inner join district as d on a.districtId=d.districtId
    inner join activityticketcategory as atc on atc.categoryId=od.categoryId
    inner join userinfo as ui on ui.userId=orders.userId
    inner join ticketpickup as tp on tp.ticketpickupId=orders.ticketpickupId
    where ui.userAccount=? order by orderDate DESC LIMIT 0,1;
    SELECT orders.orderId,od.quantity,ap.unitPrice,quantity*unitPrice as total,SUM(quantity*unitPrice) as sum FROM orderdetails as od 
    inner join orders on orders.orderId=od.orderId
    inner join activitydetails as ad on ad. activitydetailId =od. activitydetailId
	inner JOIN activityprice as ap on ap.activityId=od.activityId and ap.categoryId=od.categoryId
    inner join activityticketcategory as atc on atc.categoryId=od.categoryId
    inner join userinfo as ui on ui.userId=orders.userId
    where ui.userAccount=?  and orders.orderId=(SELECT MAX(orderId)from orders) order by orderDate DESC
    `
    conn.query(sql,
        [account,account],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            res.render("./cart/cart_finished.ejs", {
                result: rows[0],
                result2:rows[1]
            })
        });
})


// 使用優惠卷
router.post("/coupon",function(req,res){
    var sql=`select discount from coupon where couponName=?`
    conn.query(sql,[req.body.coupon],function(err,rows){
        if(err){
            console.log(err);
        }
        res.send(rows);
    })

})



module.exports = router;