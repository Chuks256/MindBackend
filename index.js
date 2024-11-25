require("dotenv").config();
require("./config/db.config");
const express=require("express")
const app=express();
const cors=require("cors");
const bodyParser=require("body-parser");
const port=4406||process.env.PORT;
const helperFunction = require("./functions/helper.function");


app.disable("x-powered-by");
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
app.use(cors());

// define function 
const apiFunction = new helperFunction();

app.post("/api/1.0/authenticateUser",apiFunction.authenticateUser);
app.get("/api/1.0/getAllPost",apiFunction.getAllPost);
app.post("/api/1.0/toggleReact",apiFunction.toggleReactionToPost);
app.post("/api/1.0/createPost",apiFunction.createPost);
app.post("/api/1.0/commentOnPost",apiFunction.commentOnPost);
app.get("/api/1.0/getAllComment",apiFunction.getAllComment);
app.get("/api/1.0/getUserData",apiFunction.getUserData);
app.get("/api/1.0/getUserSpecificPost",apiFunction.getUserSpecificPost);
app.post("/api/1.0/followUser",apiFunction.followUser);
app.get("/api/checkHealth",apiFunction.checkHealth);

app.listen(port, () => 
    console.log(`Server running on port ${port} 🔥`)
);
