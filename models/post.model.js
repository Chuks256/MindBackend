const mongooseModule=require('../config/db.config');
const postModel=new mongooseModule.Schema({
    postId:{type:String},
    userSessionTrackingId:{type:String},
    content:{type:String},
    timestamp:{type:String},
    reaction:{type:Number,default:0},
    comment:[
        {
            commentId:{type:String},
            commenterSessionTrackingId:{type:String},
            content:{type:String},
            timestamp:{type:String}
        }
    ]
});

const post=mongooseModule.model("post",postModel);

module.exports=post;