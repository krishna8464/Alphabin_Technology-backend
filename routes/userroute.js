const {UserModel} = require("../model/usermodel")
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {logger} = require("../Middleware/logger")


const userRoute = express.Router();

// user to register through the link -------> localhost:5050/user/register
                          //Body --------> 
                                            //   {
                                            //     "username" : "santosh",
                                            //     "email" : "santosh@123",
                                            //     "password" : "santosh"
                                            // }
                          //Method -------> POST  
userRoute.post("/register",logger,async(req,res)=>{
    const { username, email, password } = req.body;
    try {
        let all_data = await UserModel.find({email});
        if(all_data.length === 0){
            bcrypt.hash(password, 5,async(err,val)=>{
                if(err){
                    res.status(400).send("some thing went wrong")
                }else{
                    const user = new UserModel({username,email,password:val,history:[]});
                    await user.save()
                    res.status(200).send("User registered Successfully")
                }
            })
        }else{
            res.status(405).send("User already registered")
        }
    } catch (error) {
        res.status(400).send("some thing went wrong")
    }
})


//User to login form the link is ----------------> localhost:6060/user/login
                         //Body  ----------------> 
                                                //    {
                                                //     "email" : "santosh@123",
                                                //     "password" : "santosh"
                                                //    }
                        //Method----------------> POST 
// In response ------------------> access_tocken and userdetials will be given                        
userRoute.post("/login",logger,async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user = await UserModel.find({email});
        const hashed_pass = user[0].password;
        if(user.length>0){
            bcrypt.compare(password,hashed_pass,(err,result)=>{
                if(result){
                    const token = jwt.sign({userid:user[0]._id},process.env.KEY);
                    const {_id,username,email,avatar,password} = user[0]
                    res.status(200).send({"msg":"Login Successfull","Access_Token":token,"username":username,"email":email})
                }else{
                    res.status(401).send("Wrong Password")
                }
            })
        }else{
            res.status(404).send("User not registered")
        }
    } catch (error) {
        res.status(400).send("Wrong crenditials")
    }
})


// get history

userRoute.get("/gethistory",logger,async(req,res)=>{
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token,process.env.KEY);
        const userid = decoded.userid;
        let user_data = await UserModel.find({_id:userid});
        res.status(200).send(user_data)
    } catch (error) {
        res.status(400).send("Something went wrong")
    }
})


//userprofile update
userRoute.patch("/update",logger,async(req,res)=>{
    const body = req.body;
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token,process.env.KEY);
        const userid = decoded.userid;
        if(decoded){
            if(req.body.password){
                bcrypt.hash(req.body.password, 5,async(err,val)=>{
                    if(err){
                        res.status(400).send("some thing went wrong")
                    }else{
                        req.body.password=val
                        await UserModel.findByIdAndUpdate({_id:userid},body);
                        res.status(200).send("Updated Successfully")
                    }
                })
            }else{
            await UserModel.findByIdAndUpdate({_id:userid},body);
            res.status(200).send("Updated Successfully")
            }
        }else{
            res.status(401).send("Not Authorized")
        }
    } catch (error) {
        res.status(400).send("Something went wrong")
    }
})




/// Admin to get all users

// for admin to get all the users ----->localhost:5050/user/admin/allusers/
userRoute.get("/admin/allusers",logger,async(req,res)=>{
    try {
        let allusers = await UserModel.find();
        res.status(200).send(allusers)
    } catch (error) {
        res.status(400).send("Something went wrong")
    }
})

//admin can delete the user ----->localhost:5050/user/admin/delete/:userid
userRoute.delete("/admin/delete/:userid",logger,async(req,res)=>{
    try {
        await UserModel.findByIdAndUpdate({_id:req.params.userid});
        res.status(200).send("userdeleted Successfully")
    } catch (error) {
        res.status(400).send("Something went wrong")
    }
})



module.exports={
    userRoute
}
