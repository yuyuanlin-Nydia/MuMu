var express=require("express");
var session = require('express-session');
var path=require("path");
var app = express();


// 切出去的router
var indexRouter=require("./routes/index");
var articleRouter=require("./routes/article");
// var activityRouter=require("./routes/activity");
// var bandRouter=require("./routes/band");
// var userRouter=require("./routes/user");
// var companyRouter=require("./routes/company");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 以 express-session 管理狀態資訊
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false
}));

// Web 伺服器的靜態檔案置於 public 資料夾
app.set('views', path.join(__dirname, './views/')); 
app.engine('html', require('express-art-template'));
app.use(express.static(__dirname + '/public'));

app.use('/', indexRouter)
app.use("/article",articleRouter);
// app.use("/activity",activityRouter);
// app.use("/band",bandRouter);
// app.use("/user",userRouter);
// app.use("/company",companyRouter);





app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.「Ctrl + C」可結束伺服器程式.");



