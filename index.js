const mongo = require("mongodb");
const url = "mongodb+srv://user:user123@clusterhw.greypvj.mongodb.net/?retryWrites=true&w=majority&appName=ClusterHW";
const client = new mongo.MongoClient(url,{useNewUrlParser:true, useUnifiedTopology:true});
let db = null;
async function inDB(){
    await client.connect();
    console.log("連線成功");
    db = client.db("MessageBoard"); // MessageBoard 留言板訊息
    console.log("連線database成功");
};
inDB();

const express = require("express");
const app = express();
const session = require("express-session");
app.use(session({
    secret:"anything",
    resave:false,
    saveUnitialized:true
}));
app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static("./public"));
app.use(express.urlencoded({extended:true}));
// app route 留言板的路由
// http://localhost:3000/
app.get("/", async function(req, res){
    // 提取(所有)留言紀錄
    const collection = db.collection("message-board");
    // 不用任何篩選條件 只要有資料就好
    let result = await collection.find({});
    // 逐一取得篩選結果 + await
    let data = [];
    // 取得資料進到回乎函式用參數傳遞進來
    // 第一個member資料放到(push)data陣列裡 第二個再繼續放到陣列裡
    await result.forEach(function(m){
        // data=[] data.push(10) data=[10] data.push(20) data=[10,20]
        data.push(m)
    });
    // 最後的data是所有會員資料的一個陣列，如下
    /* data=[
        {name:我是會員, email:"yu@yu.com"},
        {name:丁丁, email:"tin@tin.com"}
    ]
    */   
    res.render("message-board.ejs",{data:data});
});

// 新增留言的路由
app.post("/message", async function(req,res){
    const name = req.body.name;
    const message = req.body.message;
    const timelock = Date();
    // 存到資料庫
    const collection = db.collection("message-board");
    let result = collection.insertOne({
        name:name,
        message:message,
        timelock:timelock
    });   
    res.redirect("/");
});
// http://localhost:3000
app.listen(3000, function(){console.log("Server connected !")})