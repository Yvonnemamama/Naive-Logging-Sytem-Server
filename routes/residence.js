var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fx = require('mkdir-recursive');

var MongoCLient = require('mongodb').MongoClient, assert = require('assert');


var imageBasicLocation = "./public/rawdata/residence/images/"  //所有图片都存放在这个目录下
var url = 'mongodb://localhost:27017/dashilan'

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("Home Page");
    res.render('index', {title: 'Express'});
});


var storage = multer.diskStorage({
    //存储文件的位置
    destination: function (req, file, cb) {
        var date = req.body.date;
        var time = req.body.time;
        var organization = req.body.organization;
        var type = req.body.type;
        var location = imageBasicLocation + path.join(date, time, organization, type);
        console.log(location);
        fx.mkdir(location, function (err) {
            cb(null, location);
            console.log('make directory done');
        });
    },

    filename: function (req, file, cb) {
        var date = req.body.date;
        var time = req.body.time;
        var organization = req.body.organization;
        var type = req.body.type;
        var pic_name = date + '_' + time + '_' + organization + "_" + type + "_" + Math.floor((Math.random() * (10000 - 0 + 1)) + 0).toString() + '.jpg';//存储的文件名
        var pic_position = path.join(date, time, organization, type, pic_name)

        MongoCLient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("begin to insert pic");
            db.collection('residence').update(
                {$and: [{date: date}, {time: time}, {organization: organization}]},
                {$addToSet: {[type]: pic_position}},
                function (err, result) {
                    assert.equal(err, null);
                    console.log("Insert an item into the " + type + " array");

                }
            );
        });

        cb(null, pic_name);
    }
});

var upload = multer({storage: storage})


//文字上传
router.post('/words', function (req, res, next) {
    console.log('\n\n');
    console.log(req.body);
    var words = req.body;
    var date = req.body.date;
    var time = req.body.time;
    var organization = req.body.organization;
    var location = req.body.location;
    var joinNumber = req.body.joinNumber;
    var theme = req.body.theme;
    var content = req.body.content;
    var other = req.body.other;
    var comment = req.body.comment;


    MongoCLient.connect(url, function (err, db) {
        assert.equal(null, err);
        var queryCondition = [{date: date}, {organization: organization}];
        db.collection("residence").find({$and: queryCondition}).toArray(function (err, result) {

            if (err) throw err;
            //如果已经存在该记录，则用新的值覆盖记录
            console.log(result);
            if (result.length != 0) {
                db.collection("residence").update({$and: queryCondition},
                    {$addToSet: {comment: comment[0]}},
                    function (err, result) {
                        assert.equal(err, null);
                        console.log("在comment列中增加新的阿姨的感想");

                        //如果还有非空的其他内容，则用这些内容替换掉原来的部分

                        if (location != "") {
                            db.collection("residence").update({$and: queryCondition},
                                { $set: {location: location} }, function (err, result) {
                                    assert.equal(err, null);
                                    console.log("补充location的值");
                                });
                        }

                        if (joinNumber != "") {
                            db.collection("residence").update({$and: queryCondition},
                                { $set: {joinNumber: joinNumber} }, function (err, result) {
                                    assert.equal(err, null);
                                    console.log("补充joinNumber的值");
                                });
                        }

                        if (theme != "") {
                            db.collection("residence").update({$and: queryCondition},
                                { $set: {theme: theme} }, function (err, result) {
                                    assert.equal(err, null);
                                    console.log("补充主题的的值");
                                });
                        }

                        if (content != "") {
                            db.collection("residence").update({$and: queryCondition},
                                { $set: {content: content}}, function (err, result) {
                                    assert.equal(err, null);
                                    console.log("补充内容的值");
                                });
                        }

                        if (other != "") {
                            db.collection("residence").update({$and: queryCondition},
                                { $set: {other: other} }, function (err, result) {
                                    assert.equal(err, null);
                                    console.log("补充其他的值");
                                });
                        }


                    });
            } else {

                db.collection("residence").insertOne(words, function (err, res) {
                    console.log(err);
                    assert.equal(null, err);
                    console.log("插入一条全新的活动记录");
                    db.close();
                });

            }
        });
    });
    res.send({ret_code: '0'});
});


// 图片上传
router.all('/pic', upload.single('file'), function (req, res, next) {
    console.log("in main pic");
    console.log(req.file);
    res.send({ret_code: '0'});

});


module.exports = router;
