// 引入 nodemailer
var nodemailer = require('nodemailer');
// 建立一個SMTP客戶端配置
var transporter = nodemailer.createTransport({
    host: "http://localhost:3000/",
    port: 25,
    service: "gmail",
    auth: {
      user: "yuyuanlin613@gmail.com",  // lab 3.2
      pass: "s1cr1t123a" // lab 3.2
    }
});
// 傳送郵件
module.exports = function (mail){
    transporter.sendMail(mail, function(error, info){
      if(error) {
        return console.log(error);
      }
      console.log('訊息發送:', info.response);
    });
  };