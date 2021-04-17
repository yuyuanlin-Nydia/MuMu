var express=require("express");
var app = express();

// Web 伺服器的靜態檔案置於 public 資料夾
// app.use( express.static("public"));
app.use(express.static(__dirname + '/public'));


app.listen(3000);