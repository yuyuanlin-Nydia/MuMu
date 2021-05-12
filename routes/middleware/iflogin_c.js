var { Error } = require('../response')
var login_render = function (req, res, next) {
    if(req.session.companyinfo) {
        next();
    } else {
        res.redirect('/')
    }
}
var login_api = function (req, res, next) {
    if(req.session.companyinfo) {
        next();
    } else {
        res.write("<script> alert('Please login!'); location.href = '/'</script>")
   
    }
}

module.exports = {
    login_render,
    login_api
}