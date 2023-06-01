const express = require("express");
const {connection} = require("./config/db");
const {errorHandler} = require("./Middleware/errorhandler");
const {logger} = require("./Middleware/logger");
const {userRoute} = require("./routes/userroute")
require("dotenv").config();

const PORT = process.env.PORT || 5050


const cors = require("cors");

let app = express();
app.use(express.json());
app.use(cors({
    origin:"*"
}))
app.use(logger);
app.use(errorHandler)

app.get("/",async(req,res)=>{
    try {
        res.send("Welcome to the server")
    } catch (error) {
        res.send(error)
    }
})

app.use("/",userRoute);

// Handle invalid routes
app.use(logger,(req, res) => {
    res.status(404).send({ error: 'Not found' });
});



app.listen(process.env.PORT,async()=>{
    try {
        await connection;
        console.log("Connected to DB")
        
    } catch (error) {
        console.log("Something went wrong while connecting to DB")
    }
    console.log(`The server is running at ${process.env.PORT}`)
})