require('dotenv').config();
const mongooseModule=require("mongoose");

try{
    mongooseModule.connect(process.env.MONGOOSE_URL).then(()=>{
        console.log("connected to cluster")
    })
}
catch(exeception){
    new Error("Something went wrong connecting to database cluster");
}

module.exports=mongooseModule;