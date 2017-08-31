var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fx = require('mkdir-recursive');

var MongoCLient = require('mongodb').MongoClient, assert = require('assert');


var imageBasicLocation = "./public/rawdata/worker/"  //所有图片都存放在这个目录下
var url = 'mongodb://localhost:27017/dashilan'

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("Home Page");
    res.render('index', {title: 'Express'});
});


var storage = multer.diskStorage({
    //存储文件的位置
    destination: function (req, file, cb) {
        var type=req.body.type;   //文件类型（视频还是图片）
        var gfrxm = req.body.gfrxm; //跟访者姓名
        var date = req.body.date //日期
        var period = req.body.beginTime+'-'+req.body.endTime;  //时间段
        console.log(typeof(date));
        console.log(typeof(gfrxm));
        console.log(typeof (period));
        console.log(typeof type);
        var location = imageBasicLocation+path.join(date,gfrxm,period,type);  //存储位置
        console.log(location);
        fx.mkdir(location, function(err) {
            cb(null, location);
            console.log('make directory done');
        });
    },

    filename: function (req, file, cb) {

        var type=req.body.type;  //文件种类
        var date = req.body.date;  //日期
        var gfrxm = req.body.gfrxm;  //采访人
        var hdmc = req.body.hdmc;   //活动名称
        var beginTime = req.body.beginTime;
        var endTime = req.body.endTime;
        var period = beginTime+'-'+endTime;  //时间段

        var location = path.join(date,gfrxm,period,type);  //存储位置
        console.log(location);

        var suffix = ""  //文件后缀名
        switch(type){
            case 'photo':
                suffix = '.jpg';
                break;

            case 'video':
                suffix = '.mp4';
                break;

            default:
                suffix = '.unknown';

        }


        var file_name = hdmc+"_"+date+"_"+gfrxm+"_"+Math.floor((Math.random()*(10000-0+1))+0).toString()+suffix;//存储的文件名
        var file_position = imageBasicLocation+path.join(location,file_name)

        MongoCLient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("begin to insert file");
            db.collection('worker').update(
                { $and: [{gfrxm:gfrxm},{date:date},{beginTime:beginTime}]},
                { $addToSet: { [type]: file_position } },
                function (err, result) {
                    assert.equal(err, null);
                    console.log("Insert an item into the "+type+" array");
                }
            );
        });

        cb(null, file_name);
    }
});

var upload = multer({storage: storage })


//文字上传
router.post('/words', function (req, res, next) {

    console.log(req.body);
    var words = req.body;

    MongoCLient.connect(url, function (err, db) {
        assert.equal(null, err);

        db.collection("worker").insertOne(words, function (err,res) {
            assert.equal(null, err);
            console.log("1 document inserted");
            db.close();
        })
    });

    res.send({ret_code: '0'});



});


// 图片上传
router.all('/attach', upload.single('file'), function (req, res, next) {
    console.log("in main attach");
    console.log(req.file);
    res.send({ret_code: '0'});

});

module.exports = router;

