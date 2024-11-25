
require('dotenv').config();
const userModel=require("../models/user.model.js");
const postModel=require("../models/post.model.js");
const jwt=require("jsonwebtoken");
const cryptoModule=require("crypto");
const user = require('../models/user.model.js');
const post = require('../models/post.model.js');


class helperFunction{
    constructor(){}

    formatTimestamp(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
      
        if (seconds < 60) {
          return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;   
      
        } else if (seconds < 3600) {
          const minutes = Math.floor(seconds / 60);
          return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (seconds < 86400) {
          const hours = Math.floor(seconds / 3600);
          return `${hours} hour${hours !== 1 ? 's' : ''} ago`;   
      
        } else {
          // For longer periods, you might want to format the date differently
          const days = Math.floor(seconds / 86400);
          return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
      }

    // generate random id 
    generateRandomId(length=0){
        return cryptoModule.randomBytes(length).toString("hex");
    }

    // encode passcode 
    encodePasscode(_string=""){
        return cryptoModule.createHash(_string).digest().toString('hex');
    }

    // authenticate user either signup or login 
    async authenticateUser(req,res){
        const {authType,username,password,profilePics}=req.body;
        const doesAcctExist = await userModel.findOne({userName:username});
        switch(authType){
            case "SIGNIN_TYPE":
                const auth_user=await userModel.findOne({password:this.encodePasscode(password)});
                if(auth_user){
                    const sessionToken=jwt.sign({authentication:auth_user.sessionTrackingId}); // create new session token 
                    res.status(200).json({authentication:sessionToken,msg:"Account_successfully_created"})
                }
                else
                if(!auth_user){
                    res.status(200).json({msg:"Account_does_not_exist"})
                }
                break;

            case "SIGNUP_TYPE":
                if(!doesAcctExist){
                    const generateUserTrackingId=this.generateRandomId(); // generate random id 
                    const newAcct=await userModel({
                        sessionTrackingId:generateUserTrackingId,
                        userName:`${username}_${this.generateRandomId(6)}`,
                        profilePics:profilePics,
                        password:this.encodePasscode(password)
                    });
                    await newAcct.save() // save new created account 
                    const sessionToken=jwt.sign({authentication:generateUserTrackingId},process.env.TOKEN_SECRET); // create new session token 
                    res.status(200).json({authentication:sessionToken,msg:"Account_created_successful"})
                }
                else
                if(doesAcctExist){
                    res.status(200).json({msg:"Account_already_exist"})
                }
                break;
        }
    }

    // function to get all post 
    async getAllPost(req,res){
        const {authentication}=req.headers;
        const verifyToken=jwt.verify(authentication,process.env.TOKEN_SECRET);
       try{
        const _getAllPost = await post({
            userSessionTrackingId:verifyToken.authentication
        })
        res.status(200).json(_getAllPost);
       }
       catch(exception){
        res.status(200).json({msg:'Something went wrong dont worry its not your fault'})
       }
    }

    // function fr reacting to post 
    async toggleReactionToPost(req,res){
        const {postId,reactionType}=req.body;
       try{
        const _getSpecificPost = await post.findOne({postId:postId});
        switch(reactionType){
            case "react":
        _getSpecificPost.reaction+=1;
        await _getSpecificPost.save();
        res.status(200).json({msg:"react_successfully"})
                break;
            
            case "unreact":
        _getSpecificPost.reaction-=1;
        await _getSpecificPost.save();
        res.status(200).json({msg:"unreact_successfully"})
                break;
        }
        }
       catch(exception){
        res.status(200).json({msg:'Something went wrong dont worry its not your fault'})
       }
    }

    // function for creating post;
    async createPost(req,res){
        const {authentication,content}=req.headers;
        const verifyToken=jwt.verify(authentication,process.env.TOKEN_SECRET);
        try{
            const createPost=new postModel({
                postId:this.generateRandomId(),
                userSessionTrackingId:verifyToken.authentication,
                content:content,
                timestamp:this.formatTimestamp(new Date())
            })
            await createPost.save();
            res.status(200).json({msg:'Post created successfully'})
        }
        catch(exception){
            res.status(200).json({msg:"Something wen wrong dont worry its not your fault"})
        }
    }

    async uploadPostMedia(req,res){}

    // function for commenting on posts 
    async commentOnPost(req,res){
        const {authentication}=req.headers;
        const {postId,commentContent}=req.body;
        const verifyToken=jwt.verify(authentication,process.env.TOKEN_SECRET);
        try{
            const _createComment=await post.findOne({postId:postId});
            await _createComment.push(
                {
                    commentId:this.generateRandomId(),
                    commenterSessionTrackingId:verifyToken.authentication,
                    content:commentContent,
                    timestamp:this.formatTimestamp(new Date())
                }
            )
        }
        catch(err){
            res.status(200).json({msg:'Something went wrong dont worry its not your fault'})
        }
    }

    // function for getting specific post comment 
    async getAllComment(req,res){
        const {postId}=req.body;
            try{
        const _getPostComment=await post.findOne({postId:postId});
        res.status(200).json(_getPostComment)
       }
       catch(err){
        res.status(200).json({msg:'Something went wrong dont worry its not your fault'})
       }
    }

    // function for getting user data 
    async getUserData(req,res){
        const {authentication}=req.headers;
        const verifyToken=jwt.verify(authentication,process.env.TOKEN_SECRET);
        try{
            const _getAllUserData=await user.findOne({sessionTrackingId:verifyToken.authentication});
            res.status(200).json(_getAllUserData);
        }
        catch(err){
            res.status(200).json({msg:'Something went wrong dont worry its not your fault'})
        }
    }

    // function for getting user specific post 
    async getUserSpecificPost(req,res){
        const {authentication}=req.headers;
        const verifyToken=jwt.verify(authentication,process.env.TOKEN_SECRET);
        try{
            const _getUserSpecificPost=await post.findOne({userSessionTrackingId:verifyToken.authentication});
            res.status(200).json(_getUserSpecificPost);
        }
        catch(err){
            res.status(200).json({msg:'Something went wrong dont worry its not your fault'})    
        }
    };

    // function to follow another user account 
    async followUser(req,res){
        const {authentication}=req.headers;
        const {type}=req.body;
        const verifyToken=jwt.verify(authentication,process.env.TOKEN_SECRET);
        const _getUserData=await user.findOne({sessionTrackingId:verifyToken.authentication});
        try{
            switch(type){
                case "FOLLOW_USER":
                    for(const sessionToken of _getUserData.followers){
                        if(verifyToken.authentication != sessionToken){
                            await _getUserData.followers.push(verifyToken.authentication);
                            await _getUserData.save();
                        }
                    }    
                break;
                
                case "UNFOLLOW_USER":
                    for(const sessionToken of _getUserData.followers){
                        if(verifyToken.authentication === sessionToken){
                            const deleteId=_getUserData.followers.filter((data)=>{
                                data!==verifyToken.authentication
                            })
                            await _getUserData.followers.push(deleteId);
                            await _getUserData.save();
                        }
                    }
                    break;
            }
        }
        catch(err){
            res.status(200).json({msg:'Something went wrong dont worry its not your fault'})    
        }
    }

    checkHealth(req,res){
        res.status(200).json("Ok")
    }

}

module.exports=helperFunction;