const mongooseModule=require('../config/db.config');

const userModel=new mongooseModule.Schema({
    sessionTrackingId:{type:String},
    userName:{type:String},
    profilePics:{type:String},
    password:{type:String},
    bookmarks:[{
        type:String
    }],
    followers:[{type:String}]
});

const user=mongooseModule.model("user",userModel);

module.exports=user;