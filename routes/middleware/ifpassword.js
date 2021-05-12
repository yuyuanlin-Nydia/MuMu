

var old_check = function(req, res, next) {
    if(req.body.oldPassword == req.session.companyinfo.cPassword) {
        next();
    } else {
        // 伺服器在回應 HTTP request 時所產生的 HTTP response 會帶上這次回應處理時的狀態，
        // 也就是利用 HTTP Status Code（HTTP 狀態碼）來表示。
        // status(500)為伺服器在處理 HTTP request 出錯時，就會回傳 500 Internal Server Error
        // status(500).send回傳錯誤訊息，ajax接收到serve端respond回傳的錯誤訊息，再根據回傳錯誤訊息內容動作
        res.status(500).send("密碼錯誤")
    }
}

var new_check = function(req, res, next) {
    if((req.body.newPassword == req.body.checkPassword) && (req.body.checkPassword != "")) {
        next();
    }else if(req.body.checkPassword == "" ) {
        res.status(500).send("密碼不能空")
    }else {
        res.status(500).send("密碼不一致")
    }
}

module.exports = {
    old_check,
    new_check
}