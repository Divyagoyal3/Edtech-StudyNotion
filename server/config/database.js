const mongoose = require("mongoose");
require("dotnev").config();

exports.connect =()=>{
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser : true,
    useUnifiedTopology:true,
})
.then(() =>{
    console.log("Db Connection Sucessful");
})
.catch(()=>{
    console.log("Error in DB connection");
    console.error(error);
    process.exit(1);
})
}