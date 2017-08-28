var express = require('express');
var router = express.Router();
var multer = require('multer')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        console.log(req.body);
        cb(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({storage: storage })

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("Home Page");
    res.render('index', {title: 'Express'});
});

// 图片上传
router.all('/api/upload', upload.single('file'), function (req, res, next) {

    var file = req.file;

    console.log('文件类型：%s', file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('文件大小：%s', file.size);
    console.log('文件保存路径：%s', file.path);

    res.send({ret_code: '0'});

});

module.exports = router;
