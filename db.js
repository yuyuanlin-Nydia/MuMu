// 建立資料庫連線
var mysql = require('mysql');
var conn = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'mumu',
	multipleStatements: true
});
conn.connect(function(err) {
	// if (err) throw err;
	if (err) {
		console.log(JSON.stringify(err));
		return;
	}
});
module.exports=conn;