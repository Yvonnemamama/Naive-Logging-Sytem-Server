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
    console.log("进入web版日志系统（非微信小程序端）");
    res.render('logging', {title: 'SWIG'});
});

router.post('/search_log', function (req, res, next) {
    console.log("从web端搜索日志");
    var worker_name = req.body.worker_name;
    console.log("worker_name="+worker_name);
    MongoCLient.connect(url, function (err, db) {
        assert.equal(null, err);
        db.collection('worker').find({gfrxm: {'$regex' : '.*' + worker_name + '.*'}}).toArray(
            function (err, result) {
                console.log(result);
                if(result.length!=0) {
                    assert.equal(err, null);
                    console.log("找到" + worker_name + "的所有日志");
                    console.log(result);
                }else{
                    console.log("未找到" + worker_name + "的任何日志");
                }
                res.json(result);
            }
        );
    });
});

router.post('/submit_log', function (req, res, next) {
    console.log("从web端提交日志");
    console.log(req.body);

});


var storage = multer.diskStorage({
    //存储文件的位置
    destination: function (req, file, cb) {
        var type = req.body.type;   //文件类型（视频还是图片）
        var gfrxm = req.body.gfrxm; //跟访者姓名
        var date = req.body.date //日期
        var period = req.body.beginTime + '-' + req.body.endTime;  //时间段
        console.log(typeof(date));
        console.log(typeof(gfrxm));
        console.log(typeof (period));
        console.log(typeof type);
        var location = imageBasicLocation + path.join(date, gfrxm, period, type);  //存储位置
        console.log(location);
        fx.mkdir(location, function (err) {
            cb(null, location);
            console.log('make directory done');
        });
    },

    filename: function (req, file, cb) {

        var type = req.body.type;  //文件种类
        var date = req.body.date;  //日期
        var gfrxm = req.body.gfrxm;  //采访人
        var hdmc = req.body.hdmc;   //活动名称
        var beginTime = req.body.beginTime;
        var endTime = req.body.endTime;
        var period = beginTime + '-' + endTime;  //时间段

        var location = path.join(date, gfrxm, period, type);  //存储位置
        console.log(location);

        var suffix = ""  //文件后缀名
        switch (type) {
            case 'photo':
                suffix = '.jpg';
                break;

            case 'video':
                suffix = '.mp4';
                break;

            default:
                suffix = '.unknown';

        }


        var file_name = hdmc + "_" + date + "_" + gfrxm + "_" + Math.floor((Math.random() * (10000 - 0 + 1)) + 0).toString() + suffix;//存储的文件名
        var file_position = imageBasicLocation + path.join(location, file_name)

        MongoCLient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("begin to insert file");
            db.collection('worker').update(
                {$and: [{gfrxm: gfrxm}, {date: date}, {hdmc: hdmc}]},
                {$addToSet: {[type]: file_position}},
                function (err, result) {
                    assert.equal(err, null);
                    console.log("Insert an item into the " + type + " array");
                }
            );
        });

        cb(null, file_name);
    }
});

var upload = multer({storage: storage})


//文字上传
router.post('/words', function (req, res, next) {

    console.log(req.body);
    var words = req.body;

    var date = req.body.date;  //日期
    var gfrxm = req.body.gfrxm;  //跟访人姓名
    var hdmc = req.body.hdmc;   //活动名称
    var beginTime = req.body.beginTime;  //开始时间
    var endTime = req.body.endTime;  //结束时间

    MongoCLient.connect(url, function (err, db) {
        assert.equal(null, err);
        var queryCondition = [{date: date}, {gfrxm: gfrxm}, {hdmc: hdmc}, {beginTime, beginTime}, {endTime, endTime}];
        db.collection("worker").find({$and: queryCondition}).toArray(function (err, result) {
                if (err) throw err;
                if (result.length != 0) {
                    var hdmb = req.body.hdmb;
                    var hdlc = req.body.hdlc;
                    var yhjy = req.body.yhjy;
                    var grgs = req.body.grgs;
                    var zzzxq = req.body.zzzxq;
                    var pykf = req.body.pykf;

                    if (hdmb != "") {
                        db.collection("worker").update({$and: queryCondition}, {$set: {hdmb: hdmb}}, function (err, result) {
                            assert.equal(err, null);
                            console.log("补充活动目标");
                        });
                    }

                    if (hdlc != "") {
                        db.collection("worker").update({$and: queryCondition}, {$set: {hdlc: hdlc}}, function (err, result) {
                            assert.equal(err, null);
                            console.log("补充活动流程");
                        });
                    }

                    if (yhjy != "") {
                        db.collection("worker").update({$and: queryCondition}, {$set: {yhjy: yhjy}}, function (err, result) {
                            assert.equal(err, null);
                            console.log("补充优化建议");
                        });
                    }

                    if (grgs != "") {
                        db.collection("worker").update({$and: queryCondition}, {$set: {grgs: grgs}}, function (err, result) {
                            assert.equal(err, null);
                            console.log("补充个人感受");
                        });
                    }

                    if (zzzxq != "") {
                        db.collection("worker").update({$and: queryCondition}, {$set: {zzzxq: zzzxq}}, function (err, result) {
                            assert.equal(err, null);
                            console.log("补充自组织需求");
                        });
                    }

                    if (pykf != "") {
                        db.collection("worker").update({$and: queryCondition}, {$set: {pykf: pykf}}, function (err, result) {
                            assert.equal(err, null);
                            console.log("补充培育看法");
                        });
                    }

                } else {
                    db.collection("worker").insertOne(words, function (err, res) {
                        assert.equal(null, err);
                        console.log("插入一条新的记录");
                        db.close();
                    });
                }
            }
        );
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

