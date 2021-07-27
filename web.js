//#region 초반 선언부
const express = require('express');
const port = 3000;
const log = console.log;

const bodyparser= require('body-parser');
const app = express();

app.use(express.static(__dirname + '/public/'))
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
//app.set('view engine', 'ejs');
app.set('view engine', 'pug');
//app.engine('html', require('ejs').renderFile);

app.use('/script',express.static(__dirname + "/script"));
app.use('/views',express.static(__dirname + "/views"));

const { MongoClient } = require("mongodb");
//#endregion

//#region DB연결 및 라우팅
const uri =
  "mongodb+srv://cutiefunny:ghks1015@macrodb.srkli.mongodb.net/macroDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect();

app.listen(port, ()=>{
    console.log('3000번 포트에 대기중!')
})
console.log("server started");

app.get('/', function (req, res) {
    res.render('index', { title: 'Hey'
                        , message: 'Hello there!'
                        , message2: 'test'
                    });
  });
//#endregion

//ajax 인터페이스
app.get('/getajax', function(req, res, next) { res.render("/ajax"); });

//ajax 컨트롤러
app.post('/ajax', function(req, res, next) {

  if(req.body.op=="R")
  searchData(req.body.msg,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        res.send({result:"R", msg:msg});
                      });
  else if(req.body.op=="C")
  insertData(req.body.msg,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        res.send({result:"C", msg:msg});
  });
  else if(req.body.op=="D")
  delData(req.body.msg,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        res.send({result:"D", msg:msg});
  });
  else if(req.body.op=="I")
  searchData("","userList").then((msg) => {
                        console.log(msg);
                        res.send({result:"I", msg:msg});
  });

});

/* CRUD 함수 시작 */

async function searchData(req,col,userID){

    var database = client.db("macroDB");
    var userList = database.collection(col);
    if(col=="whiteList") users = await userList.find({ name: {$regex:req} }).toArray();
    else if(col=="userList") users = await userList.find({ user: {$regex:req} }).toArray();
    else if(col=="tags") users = await userList.find({ tag: {$regex:req}, user : userID }).sort({seq:1}).toArray();

    var list = [];
    users.forEach(element => {
      if(col=="whiteList" && !list.includes(element.name)) list.push(element.name);
      else if(col=="userList" && !list.includes(element.user)) list.push(element.user);
      else if(col=="tags" && !list.includes(element.tag)) list.push(element.tag);
    });
    return list;
}

async function getData2(req){

  var database = client.db("macroDB");
  var userList = database.collection("history");
  users = await userList.find({ userName: {$regex:req} }).toArray();

  var list = [];
  users.forEach(element => {
    if(!list.includes(element.contents.split('#')[0])) {
      var strArray = element.contents.split('#');
      list.push(strArray[0]);
    }
  });
  return list;
}

async function insertData(req,col,userID){

  var database = client.db("macroDB");
  var userList = database.collection(col);
  var filter;
  var doc;
  if(col=="whiteList"){
    filter = {name:req};
    doc = { $set: { name : req, lastDate : "20210727" } };
  }else if(col=="userList"){
    filter = {user:req};
    doc = { $set: { user : req } };
  }else if(col=="tags"){
    var seq = await userList.find({ tag: {$regex:""}, user : userID}).sort({seq:-1}).toArray();
    console.log(seq[0].seq);
    filter = { tag : req, user : userID };
    doc = { $set: { seq : seq[0].seq+1, tag : req, user : userID } };
  }
  userList.updateOne(filter,doc,{upsert:true});
  //userList.insertOne(doc);

  return req;
}

async function delData(req,col,userID){

  var database = client.db("macroDB");
  var userList = database.collection(col);
  var doc;
  if(col=="whiteList") doc = { name : req };
  else if(col=="userList") doc = { user : req };
  else if(col=="tags") doc = { tag : req, user : userID };
  userList.deleteOne(doc);

  return req;
}

/* CRUD 함수 끝 */ 