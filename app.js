//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://admin-jeremy:Sswoy123@cluster0.id8me.mongodb.net/blogDB", {
  useNewUrlParser: true
});
const itemSchema={
  name:String,
  content:String
};
const Item= mongoose.model("Post",itemSchema);

// const postSchema={
//   name:String,
//   content:String
// }
// const Post= mongoose.model("Post",itemSchema);

const homeStartingContent = {
  name:"首頁",
  content:"歡迎來到承修的留言板,點擊留言給我,你可以寫下任何你想留言的哦"
};
const aboutContent = {
  name:"關於",
  content:"在大都會公園拍夕陽餘暉下的青青綠草"
};
const contactContent = {
  name:"聯絡",
  content:"風和日麗的擎天崗"
};

const defaultItems=[homeStartingContent,aboutContent,contactContent];



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res){
  Item.find({},function(err,itemFound){
    if(!err){
      if(itemFound.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
             console.log(err)
          }else{
            res.render("home", {startingContent:itemFound});
            console.log("Successfuly added default items")
          }
        });
      }else{
        Item.find({name:{$nin:["聯絡","關於"]}},function(err,contentFound){
          if(err){
            console.log(err)
          }else{
            res.render("home", {startingContent:contentFound});
          }
        })
      }
    }
  })
});


app.get("/about", function(req, res){
    Item.findOne({name:"關於"},function(err,contentFound){
      if(err){
        console.log(err)
      }else{
        res.render("about", {aboutContent:contentFound.content});
      }
    })

});

app.get("/contact", function(req, res){
  Item.findOne({name:"聯絡"},function(err,contentFound){
    if(err){
      console.log(err)
    }else{
      res.render("contact", {contactContent:contentFound.content });
    }
  })

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


  // posts.forEach(function(post){
  //   const storedTitle = _.lowerCase(post.title);
  //
  //   if (storedTitle === requestedTitle) {
  //     res.render("post", {
  //       title: post.title,
  //       content: post.content
  //     });
  //   }
  // });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
