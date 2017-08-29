var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fx = require('mkdir-recursive');

var MongoCLient = require('mongodb').MongoClient, assert = require('assert');


var imageBasicLocation = "./public/residence/images/"  //所有图片都存放在这个目录下
var url = 'mongodb://localhost:27017/dashilan'

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("Home Page");
    res.render('index', {title: 'Express'});
});


var storage = multer.diskStorage({
    //存储文件的位置
    destination: function (req, file, cb) {
        var date=req.body.date;
        var time=req.body.time;
        var organization = req.body.organization;
        var type = req.body.type;
        var location = imageBasicLocation+path.join(date,time,organization,type);
        console.log(location);
        fx.mkdir(location, function(err) {
            cb(null, location);
            console.log('make directory done');
        });
    },

    filename: function (req, file, cb) {
        var date=req.body.date;
        var time=req.body.time;
        var organization = req.body.organization;
        var type = req.body.type;
        var pic_name = date+'_'+time+'_'+organization+"_"+type+"_"+Math.floor((Math.random()*(10000-0+1))+0).toString();//存储的文件名
        var pic_position = path.join(date,time,organization,type,pic_name)

        MongoCLient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("begin to insert pic");
            db.collection('residence').update(
                { $and: [{date:date},{time:time},{organization:organization}]},
                { $addToSet: { [type]: pic_position } },
                function (err, result) {
                    assert.equal(err, null);
                    console.log("Insert an item into the "+type+" array");
                }
            );
        });

        cb(null, pic_name);
    }
});

var upload = multer({storage: storage })


//文字上传
router.post('/words', function (req, res, next) {

    console.log(req.body);
    var words = req.body;

    // words['activity'] = [];
    // words['sheet'] = [];
    MongoCLient.connect(url, function (err, db) {
        assert.equal(null, err);

        db.collection("residence").insertOne(words, function (err,res) {
            assert.equal(null, err);
            console.log("1 document inserted");
            db.close();
        })
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
