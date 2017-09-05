# 微信小程序-政务公开

### TODO：

把各个owner的图片放到相应的位置

完成提交政务信息





## 效果图

效果预览：  

![Alt text](./wechat-v2ex-1.gif)  
![Alt text](./wechat-v2ex-2.gif)  





getAllNodeList: _getAllNodesList,
  getHotestList: _getHotestList,
  getLatestList: _getHotestList,
  getNodeList: _getNodeList,
  getPassageDetail: _getPassageDetail,
  getCommentDetailList: _getCommentDetailList



## API设计（全部是get请求）

#### 获取最近文章列表

/api/passages/latest

客户端url:`getLatestList`

ret：元组

```json
[{
  passage_id: 3,
  title: "中国好"，
  owner: "大栅栏街道"，
  passage_type: "政策"，
  reply_number：33
},{
   passage_id: 6,
   title: "抬头巷修路"，
   owner: "建筑局"，
   passage_type: "工程"，
   reply_number：33
}]
```



#### 返回最热门文章列表

/api/passages/hotest

客户端url：`getHotestList`

ret: 元组

```son
[{
  passage_id: 3,
  title: "中国好"，
  owner: "大栅栏街道"，
  passage_type: "政策"，
  reply_number：33
},{
   passage_id: 6,
   title: "抬头巷修路"，
   owner: "建筑局"，
   passage_type: "工程"，
   reply_number：33
}]
```



#### 返回所有节点类型

/api/nodes

客户端url：`getAllNodesList`

ret: 元组

```json
[
  {
    node_id: 2,
    passage_type: "政策"
  },{
    node_id: 6,
    passage_type: "工程"
  }
]
```



#### 返回某种节点下的文章列表

/api/passages/node?node_id=3

客户端url:`getNodeList`

ret

```json
[{
  passage_id: 3,
  title: "中国好"，
  owner: "大栅栏街道"，
  passage_type: "政策"，
  reply_number：33
},{
   passage_id: 6,
   title: "抬头巷修路"，
   owner: "建筑局"，
   passage_type: "工程"，
   reply_number：33
} ]
```







#### 返回文章的具体内容

/api/detail/passage?passage_id=4

客户端url: ` getPassageDetail`

ret

```
{
  passage_id: 3,
  title: "中国好"，
  owner: "大栅栏街道"，
  time: "2017-9-11",
  passage_content: "今天习总书记好"
}
```



#### 获取评论的具体内容列表

/api/detail/comment?passage_id=3

客户端url: `getCommentDetailList`

ret

```json
[
  {
    comment_id: 2,
    time: "2014-4-2"
    username: 'root',
    reply_content: "真棒"
  },{
    comment_id:4,
    time: "2019-3-9",
    username: 'root'，
    reply_content: "垃圾"
  }
]
```



