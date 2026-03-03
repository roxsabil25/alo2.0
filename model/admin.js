const mongoose = require("mongoose");

const adminModel = new mongoose.Schema({

    name:String,
    pass:String

});

module.exports = mongoose.model("admin" , adminModel)