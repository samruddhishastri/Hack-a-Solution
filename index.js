//jshint esversion:6
// require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/hackDB", {useUnifiedTopology: true, useNewUrlParser: true});

const userSchema = {
  name:{
    type: String,
    unique: true
  },
  email: String,
  password: String,
  username: {
    type: String,
    unique: true,
  },
  certificationNumber : {
    type: String,
    unique: true
  },
  address: String,
  NumberOfBeds: Number,
  contact: Number,
  district: String,
  city: String,
};

const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/display", function(req,res){
  var foundHospitals = [];
  res.render("displays", { newListItems: foundHospitals});
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/HospitalData", function(req,res){
  res.render("generalDetails");
});

app.post("/GetHospitals", function(req,res){
  User.find({district:req.body.district}, function(err,foundHospitals){
    if(!err){
      res.render("displays", { newListItems: foundHospitals});
    }else{
      res.send(err);
    }
  });
});

app.get("/ChangeData", function(req,res){
  res.render("update_details");
});

app.get("/upadteData", function(req,res){
  res.render("generalDetails");
});

app.post("/register", function(req,res){

  bcrypt.hash(req.body.password, saltRounds, function(err,hash){
    const newUser = new User({
      email: req.body.email,
      password: hash,
      name:req.body.name,
      username: req.body.username,
      certificationNumber :req.body.certificationNumber,
      district: req.body.district,
      city: req.body.city,
    });

    newUser.save(function(err){
      if(err){
        res.send("Entered username is already in use or hospital with the entered name is already registered!");
      } else{
        res.render("docHome");
      }
    });
  });
});

app.post("/login", function(req,res){

  const username = req.body.username;
  const password =  req.body.password;

  User.findOne({username: username}, function(err,foundUser){
    if(err){
      console.log(err);
    } else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err,result){
          if(result === true){
            res.render("update_details", {username : username});
          }
        });
      }
    }
  });
});

app.post("/EditHospitalData", function(req,res){
  User.updateOne(
    {username: req.body.username},
    {$set: req.body},
    function(err){
      if(!err){
        res.render("docHome");
      } else{
        res.send("Oops, something went wrong! Please try again.");
      }
    }
  )
});

app.listen(9000, function(){
  console.log("server started on port 9000.");
});
