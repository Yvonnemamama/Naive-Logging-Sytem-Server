var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fx = require('mkdir-recursive');

var MongoCLient = require('mongodb').MongoClient, assert = require('assert');


var imageBasicLocation = "./public/rawdata/residence/images/"  //所有图片都存放在这个目录下
var MongodbMongodbUrl = 'mongodb://localhost:27017/dashilan'

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("Home Page");
    res.render('index', {title: 'Express'});
});

/* 居民上传表单信息记录
 *
 * 1.具体工作：
 *      直接在mongoDB，dashilan表中插入一条新记录
 *
 * 2.log信息：
 *    例：[REQUEST] 张三 居民提交表单记录
 *        [REQUEST] 'request的具体信息'
 *        [REQUEST ERROR] 'error的具体信息'
 *        [REQUEST] 某个组织 的 张三 居民提交表单记录成功
 *        
 */
router.post('/words', function (req, res, next) {
    var words = req.body;
    var name = req.body.name;
    var organization = req.body.organization;

    console.log('[REQUEST] '+name+' 居民提交表单记录');
    console.log("[REQUEST] "+req);

    //在mongodb中插入一条新记录
    MongoCLient.connect(MongodbUrl, function (err, db) {
        assert.equal(null, err);
        db.collection("residence").insertOne(words, function (err, res) {
            console.log("[REQUEST ERROR]"+err);
            assert.equal(null, err);
            console.log("[REQUEST] "+organization+" 的 "+name+" 居民提交表单记录成功\n\n");
            db.close();
        });
    });


    res.send({ret_code: '0'});
});


/* 居民上传图片
 *
 * 1.具体工作：
 *      ~ 创建图片存储位置的文件夹, 格式为 2018-01-25/组织名称/
 *      ~ 确定图片的存储名称， 格式为：2018-01-25_组织名称_活动图片_张三_随机数.jpg
 *      ~ 将确定的文件路径存入mongodb的数据库中对应的那条记录里
 *
 *
 * 2.log信息：
 *    例：[REQUEST PIC] 居民提交照片
 *        [REQUEST PIC] 图片存储位置：位置信息
 *        [REQUEST PIC] 图片存储位置路径创建完成
 *        [REQUEST PIC] 将新图片位置插入对应的数据库信息中
 *        [REQUEST PIC] 新图片名称 插入数据库成功
 *
 *
 */
var storage = multer.diskStorage({

    /* 创建存储文件的位置的文件夹 */
    destination: function (req, file, cb) {
        var date = req.body.date;
        var organization = req.body.organization;
        var location = imageBasicLocation + path.join(date, organization);
        console.log("[REQUEST PIC] 图片存储位置："+location);
        fx.mkdir(location, function (err) {
            // 根据我的猜测，这个cb应该是回调这个标准接口的，把location的信息传给它
            cb(null, location);
            console.log('[REQUEST PIC] 图片存储位置路径创建完成\n');
        });
    },

    /* 创建存储这个文件的名字 */
    filename: function (req, file, cb) {
        var date = req.body.date;
        var organization = req.body.organization;
        var name = req.type.name;
        var type = req.body.type;
        var type_str = (type==="activity")?"活动图片":"微创投记录";
        //存储的文件名
        var pic_name = date + '_' + organization + "_" + type_str + "_"+ name +"_"+ Math.floor((Math.random() * (10000 - 0 + 1)) + 0).toString() + '.jpg';
        var pic_position = path.join(date, organization, pic_name)

        //在mongodb对应的信息里插入图片的位置信息
        MongoCLient.connect(MongodbUrl, function (err, db) {
            assert.equal(null, err);
            console.log("[REQUEST PIC] 将新图片位置插入对应的数据库信息中");
            db.collection('residence').update(
                {$and: [{date: date}, {name: name}, {organization: organization}]},
                {$addToSet: {[type]: pic_position}},
                function (err, result) {
                    assert.equal(err, null);
                    console.log("[REQUEST PIC] "+pic_name+" 插入数据库成功");

                }
            );
        });

        // 我的猜测应该没错，这里是回调上层的接口，把图片的名字传给它
        cb(null, pic_name);
    }
});

var upload = multer({storage: storage});


// 居民图片上传
router.all('/pic', upload.single('file'), function (req, res, next) {
    console.log("[REQUEST PIC] 居民提交照片\n\n");
    res.send({ret_code: '0'});

});


module.exports = router;
