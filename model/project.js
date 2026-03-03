const mongoose = require('mongoose');

const projectModel = new mongoose.Schema({
    projectTitle:{
        type:String,
        required:true
    },
    projectname:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    projectgoal:{
        type:String
    },
    projectarea:{
        type:String
    },
    beneficiary:{
        type:String
    },
    projectobjectives:{
        type:[String]
    },
    coverimage:{
        type:String
    },
    extraimage: [
    {
        type: String
    }
]
});

module.exports = mongoose.model('project',projectModel);