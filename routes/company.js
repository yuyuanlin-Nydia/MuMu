var express = require("express");
var router = express.Router();
var conn = require("../db");
const multer = require('multer');
var { Success, Error } = require('./response');
// var {  old_check, new_check } = require('./middleware/ifpassword');
// const { response } = require("express");
var { login_render, login_api } = require('./middleware/iflogin_c')

router.get("/",login_render, function (req, res) {
	function dateString(e) {
		var mmddyy = new Date(e);
		var date = mmddyy.getFullYear().toString() + "年" + (mmddyy.getMonth() + 1).toString() + "月" + mmddyy.getDate().toString() + "日";
		return date;
		}
	var sql = `SELECT a.activityId,c.companyId,companyName,companyFile,activityTitle,activityFile,activityLocation,minDate,maxDate,
	sellDate,WEEKDAY(minDate)as min,WEEKDAY(maxDate)as max,WEEKDAY(sellDate)as sell 
	FROM activityinfo a 
	INNER JOIN companyinfo c on(a.companyId=c.companyId) 
	INNER JOIN (select activityId ,MIN(activityDate) as minDate,MAX(activityDate)as maxDate
	from activitydetails
	group by activityId)as d ON(a.activityId=d.activityId)WHERE del =0 && c.companyId=? && maxDate>now() ORDER BY upDated DESC;

	SELECT a.activityId,c.companyId,companyName,companyFile,activityTitle,activityFile,activityLocation,minDate,maxDate,
	sellDate,WEEKDAY(minDate)as min,WEEKDAY(maxDate)as max,WEEKDAY(sellDate)as sell 
	FROM activityinfo a 
	INNER JOIN companyinfo c on(a.companyId=c.companyId) 
	INNER JOIN (select activityId ,MIN(activityDate) as minDate,MAX(activityDate)as maxDate
	from activitydetails
	group by activityId)as d ON(a.activityId=d.activityId)WHERE del =0 && c.companyId=? && maxDate<now() ORDER BY sellDate DESC;
	SELECT companyId,companyName,companyFile FROM companyInfo WHERE  companyId=?`;
	
	var session = req.session.companyinfo;
	var data = [session.cid,session.cid,session.cid];
	conn.query(sql,data,
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}

			res.render('./company/company_mainPage.ejs', {
				data: rows[0],
				data2: rows[1],
				data3: rows[2],
				Caccount: session.cAccount,
				Cname: session.cName,
				Cphone: session.cPhone,
				Cmail:session.cEmail,
				Cfile:session.cFile,
				
			});
		}
	);

})



// 編輯活動
router.get("/edit", login_api, function (req, res) {
	var sql ='select * from companyinfo left join area on companyinfo.areaId = area.areaId  left join district on area.districtId = district.districtId where companyAccount = ?';
	var account = req.session.companyinfo.cAccount;
	conn.query(sql,[account],
		function (err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}

			res.render('./company/company_edit.ejs', {
				data: rows,
			
			});
		}
	);
	
});
//刪除活動

router.post("/delete", function (req, res) {
    var sql = `update activityInfo SET del=1 where activityId=?`
    conn.query(sql, [req.body.activityId], function (err, rows) {
        if (err) {
            console.log(err)
        };
        res.send("delete successed.")
    })
})



// 編輯頁面
router.post('/edit/detail',function (req, res) {
	var body = req.body
	var sql = `UPDATE companyinfo SET companyEmail = ?, companyPhone = ?,areaId= ?,companyDis=?, companyAddress = ? WHERE  companyAccount = ?`;
	var session = req.session.companyinfo;
	var data =[body.e_mail, body.phone,  body.town, body.city,body.address, session.cAccount];
	conn.query(sql, data,
		function (err, rows) {
			if(rows.affectedRows){
				res.end(

					JSON.stringify(new Success('update success'))
				)
			} else {
				res.end(
					JSON.stringify(new Error('update failed'))
				)
			}
		});

});
// 更改密碼
router.post('/edit/password', function (req, res) {
	var body = req.body
	var sql = `UPDATE companyinfo SET companyPassword = ? WHERE  companyAccount = ?`;
	var session = req.session.companyinfo;
	var data =[body.password_cfm, session.cAccount];
	conn.query(sql, data,
		function (err, rows) {
			if(rows.affectedRows){
				res.end(
					JSON.stringify(new Success('update success'))
				)
			} else {
				res.end(
					JSON.stringify(new Error('update failed'))
				)
			}
		});

});
//舊密碼確認
router.post('/checkpw', function (req, res) {
    var session = req.session.companyinfo;
    var body = req.body;
    var sql = `select companyId from companyinfo where companyPassword=? AND companyId=?`
    var data = [body.password_before, session.cid]
    conn.query(sql, data, function (error, results, fields) {
        // console.log(results[0]);
        if (results[0]) {
            res.end(
                JSON.stringify('old password is correct'),
            )
        } else {
            res.end(
                JSON.stringify(new Success('old password is false')),
            )
        }
    })
})

router.post("/edit/town",function(req,res){
	var sql = `select town, areaId from area inner join district as d on d.districtId = area.districtId where d.districtId = ?`;
	conn.query(sql,[req.body.districtId],function(err,rows){
		if(err) {
			console.log(err);
		}
		res.send(rows)
	})
})


router.post("/edit/district",function(req,res){
	var sql = `select * from district`;
	conn.query(sql,[],function(err,rows){
		if (err) {
			console.log(err);
		}
		res.send(rows)
	})
})

// 上傳大頭貼
    router.post("/cavatarUpload", function (req, res) {
        var session = req.session.companyinfo
        var body = req.body
        conn.query('UPDATE companyinfo SET companyFile = ? WHERE companyinfo.companyId = ?',
         [body.image,session.cid], function (err, rows) {
          if (err) {
           console.log(JSON.stringify(err));
           return;
          }
       
         })
        res.send("successfully update avatar");
       })

       var myStorage = multer.diskStorage({
        destination: function (req, file, cb) {
         cb(null, "./public/image/upload/company"); // 保存的路徑
        },
       
        filename: function (req, file, cb) {
         // 檔名日期+原檔名
         var Today = new Date();
         var date = Today.getFullYear().toString() + (Today.getMonth() + 1).toString().padStart(2, "0") + Today.getDate().toString().padStart(2, "0");
         cb(null, date + '-' + file.originalname); // 自定義檔案名稱
        }
       });
       
       var upload = multer({
        storage: myStorage, // 設置 storage
       });


       router.post('/upload/cavatarfile', upload.single('file'), function (req, res) {
        res.send("上傳成功");
       });
// 活動編輯的地址	   
router.post("/town/user", function (req, res) {
	conn.query(`SELECT town,areaId FROM area INNER join district as d on d.districtId=area.districtId 
	where area.districtId=
	(SELECT districtId from activityinfo as ai
	inner join area on area.areaId=ai.areaId 
	 where activityId=1)`,
		[req.body.activityId], function (err, rows) {
			if (err) {
				console.log(err);
			}
			res.send(rows)
		})
	})


module.exports = router;