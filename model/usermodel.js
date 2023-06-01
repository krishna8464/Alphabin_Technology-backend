const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username : String,
    email : String,
    password : String,
    history : []
},{
    versionKey:false
})

const UserModel = mongoose.model("users",userSchema);

module.exports={
    UserModel
}