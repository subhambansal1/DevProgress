const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({

userEmail:String,
title:String,
issuer:String,
date:String,
url:String,
pdf:String,
skills:String,
proctored:Boolean

});

module.exports = mongoose.model("Certificate",certificateSchema);