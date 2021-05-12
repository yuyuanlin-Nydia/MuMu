var express = require("express");
const { getMaxListeners } = require("../db");
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
        conn.query(sql, [ account,account, req.activityId, req.activityDetailId, req.categoryId1, req.quantity1,account, req.activityId, req.activityDetailId, req.categoryId2, req.quantity2],
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
// 把優惠券加進資料庫
router.post("/couponAdd", function (req, res) {
    var account=req.session.userinfo.account;
    var sql=`update cart set couponId=(SELECT couponId from coupon where couponName=?) where userId=(SELECT userId from userInfo where userAccount=?)`
    conn.query(sql,[req.body.couponName,account],
        function (err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                return;
            }
            
        }
    );
})
// 付款頁面
router.get('/pay', function (req, res) {
    var account = req.session.userinfo.account;
    var sql = `select cart.cartId,cart.userId,cd.activityId,cd.activityDetailId,cd.categoryId ,cd.quantity from cartdetails as cd
    INNER JOIN cart on( cart.cartId =cd.cartId) 
    INNER JOIN userInfo as ui on( ui.userId =cart.userId) 
    where(ui.userAccount="?");
    select cartId,couponId from cart where userId=(select userId from userInfo where userAccount=?);`
    conn.query(sql,
        [account,account],
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
    var d=new Date();
    var date=d.getFullYear().toString().substring(2,4)+(d.getMonth()+1).toString().padStart(2,"0")+d.getDate().toString().padStart(2,"0")+Math.ceil(Math.random()*899+100)
    var sql = `insert into orders (orderId ,userId,ticketPickupId,couponId,card1,card2,card3,card4,month,year)values(?,(select userId from userInfo where userAccount=?),?,?,?,?,?,?,?,?);
    INSERT INTO orderdetails(orderId,activityId, activitydetailId,categoryId,quantity) SELECT (SELECT orderId from orders where orderDate=(SELECT max(orderDate) from orders)),activityId, activitydetailId,categoryId,quantity FROM cartdetails 
    WHERE cartId= (SELECT cartId from cart inner JOIN userinfo as ui on ui.userId=cart.userId WHERE ui.userAccount=?);
    delete from cart where cartId=?;
    delete from cartdetails where cartId=?; 
    `
    
    conn.query(sql,
    [date,account,r.ticketPickupId,r.couponId, r.card1, r.card2, r.card3, r.card4, r.month, r.year, account,r.cartId, r.cartId],
    function (err, rows) {
        if (err) {
            console.log(JSON.stringify(err));
            return;
        }
    });
    res.redirect("/cart/finish");
})


//完成付款
//第一句是明細 第二句是總金額(扣掉優惠)
router.get("/finish", function (req, res) {
    var account = req.session.userinfo.account;
    var sql = `SELECT orders.orderId,ai.activityTitle,ai.activityLocation,d.city,a.town,ai.activityAddress,od.quantity,atc.type,orders.orderDate,orders.card1,orders.card2,orders.card3,orders.card4,tp.method FROM orderdetails as od 
    inner join orders on orders.orderId=od.orderId
    inner join activityinfo as ai on ai.activityId=od.activityId
    inner join area as a on ai.areaId=a.areaId
    inner join district as d on a.districtId=d.districtId
    inner join activityticketcategory as atc on atc.categoryId=od.categoryId
    inner join userinfo as ui on ui.userId=orders.userId
    inner join ticketpickup as tp on tp.ticketpickupId=orders.ticketpickupId
    where ui.userAccount=? order by orderDate DESC LIMIT 0,1;
    SELECT od.orderDetailsId,od.quantity,ap.unitPrice,(SUM((quantity*unitPrice))-c.discount) as sum FROM orderdetails as od 
    inner join orders on orders.orderId=od.orderId
    inner join activitydetails as ad on ad.activitydetailId =od.activitydetailId
	inner JOIN activityprice as ap on ap.activityId=od.activityId and ap.categoryId=od.categoryId
    inner join activityticketcategory as atc on atc.categoryId=od.categoryId
    inner join userinfo as ui on ui.userId=orders.userId
    inner join coupon as c on c.couponId=orders.couponId
    WHERE ui.userAccount=? and orders.orderId=(SELECT orderId from orders where orderDate=(SELECT max(orderDate) from orders))
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
router.post("/town",function(req,res){
	conn.query('SELECT town,areaId FROM `area` INNER join district as d on d.districtId=area.districtId where d.districtId=?',
		[req.body.districtId],function(err,rows){
		if (err) {
			console.log(err);
		}
		res.send(rows)
	})
})
router.post("/district",function(req,res){
	conn.query('SELECT * from `district`',
		[],function(err,rows){
		if (err) {
			console.log(err);
		}

		res.send(rows)
	})
})


module.exports = router;