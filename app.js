//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true});


//////////////////////////////////////////////////////////////////////////
//1)I have to reate a schem first
const itemSchema = new mongoose.Schema({
  name: String,
});

// 2) Then I have to creame a model that takes into consideration that schema
const Item = mongoose.model("Item", itemSchema);

// 3) I have to create the documents using my schema and model.

const item1 = new Item ({
  name: "Welcome to your list"
});
const item2 = new Item ({
  name: "Hit the + button to add a new item"
});
const item3 = new Item ({
  name: "<-- Hit this to delate an item"
});

const defaultItems = [item1, item2, item3];

//////////////////////////////////////////////////////////////////////////////

const listSchema =  new mongoose.Schema({
  name: String,
  items: [itemSchema],
});


const List = mongoose.model("List", listSchema);
/////////////////////////////////////////////////////////////////////////
//  Item.deleteOne ({name: "Welcome to your list"}, (err)=>{
//   if(err){
//     console.log(err);
//   }else{
//     console.log("It is working properly");
//   }
// });
// Item.deleteOne ({name: "Hit the + button to add a new item"}, (err)=>{
//  if(err){
//    console.log(err);
//  }else{
//    console.log("It is working properly");
//  }
// });
// Item.deleteOne ({name: "<-- Hit this to delate an item"}, (err)=>{
//  if(err){
//    console.log(err);
//  }else{
//    console.log("It is working properly");
//  }
// });

///////////////////////////////////////////////////////////////////////////////


app.get("/", function(req, res) {

  Item.find((err, items) =>{

      if(items.length === 0){
        Item.insertMany (defaultItems, (err)=>{
          if(err){
            console.log(err);
          }else{
            console.log("It is working properly, items saved");
          }
        });
        res.redirect("/");
      }else{

      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

});
///////////////////////////////////////////////////////////////////////////////

// using this code, I can grab the value that an user write in the URL,
// afterwards writing /
// app.get("/:customListName", (req,res)=>{
//   console.log(req.paras.customListName)
// })

///////////////////////////////////////////////////////////////////////////////

// In this way I can create a new colecttion depend on the value that the user
// wants to add to the URL path.

app.get("/:customListName", (req,res)=>{
  const userPath =_.capitalize (req.params.customListName);
  List.findOne({name:userPath}, (err,results)=>{
    if (!err) {
      if(!results){
        // create a new list
        const list= new List({
          name: userPath,
          items: defaultItems,
        });
          list.save();
          // to redirect to the correct
          res.redirect("/" + userPath);
      }else{
        // show an existing list
      res.render("list", {listTitle: results.name, newListItems: results.items})
      }

    }
  });

});


///////////////////////////////////////////////////////////////////////////////

app.post("/", function(req, res){

   const itemName = req.body.newItem;
   const listName = req.body.list;
   const item = new Item ({
     name: itemName,
   });
   if(listName === "Today"){
     item.save();
     res.redirect("/");
   }else{
     List.findOne({name:listName}, (err, foundList)=>{
       foundList.items.push(item);
       foundList.save();
       res.redirect("/" + listName );
     });
   }

   });

//////////////////////////////////////////////////////////////////////////////

app.post("/delete", (req, res)=>{
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName == "today"){
  Item.findByIdAndRemove(checkItemId, (err)=>{
    if(!err){
      console.log("this item was deleted");
    }
});
  res.redirect("/");
}else {
   List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkItemId}}}, (err, foundList)=>{
     if(!err){
       res.redirect("/" + listName)
     }
   });
 }
});





app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
