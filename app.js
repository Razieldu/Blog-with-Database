//jshint esversion:6
require("dotenv").config();
const express = require("express");
const request =require("request")
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose=require("mongoose");

mongoose.connect(process.env.SECRET, {
  useNewUrlParser: true
});
const itemSchema={
  name:String,
  content:String
};
const Item= mongoose.model("Post",itemSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const cities=["Taipei","Taichung","Tainan","Kaohsiung"]
const cityArray=[]
const cityUrls=[]

app.get("/", function(req, res, next){

  const key =process.env.WEATHER

  for(i=0;i<cities.length;i++){
    request("https://api.openweathermap.org/data/2.5/weather?q="+cities[i]+"&appid="+key+"&units=metric", function (error, response, body) {
      const newBody=JSON.parse(body)
      eval("const"+i+"city="+body)

      let urlCom="http://openweathermap.org/img/wn/"+newBody.weather[0].icon+"@2x.png"

     cityArray.push(eval("const"+i+"city"))
     cityUrls.push(urlCom)

     })
   }
  next()
 },function(req,res){
  Item.find({},function(err,itemFound){
  if(!err){

  res.render("home", {startingContent:itemFound,
                        cityName:cityArray,
                        cityIcon:cityUrls

    })
    }else{
    console.log(err)
      }});
  }
);




app.get("/about", function(req, res){
        res.render("about");
});

app.get("/contact", function(req, res){
      res.render("contact");
});


app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){

  const postNew= new Item({
    name:req.body.postTitle,
    content:req.body.postBody
  })
  postNew.save();
  res.redirect("/");
});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);
  Item.find({name:requestedTitle},function(err,contentFound){
    if(err){
      console.log(err)
    }else{
      res.render("post",{title:requestedTitle,content:contentFound[0].content})
    }
  })
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
