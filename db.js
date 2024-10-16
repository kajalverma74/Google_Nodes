// 

const mongoose = require('mongoose');

const mongoURL = 'mongodb://localhost:27017/social_login';
mongoose.connect(mongoURL);

 const db = mongoose.connection;

 db.on('connected',() =>{
    console.log('connected to MongoDB server');
 });

 db.on('error',(err) =>{
    console.log('MongoDb connection error');
 });

 db.on('disconnected',() =>{
    console.log('disconnected to MongoDB server');
 })
  
 module.exports = db;
  