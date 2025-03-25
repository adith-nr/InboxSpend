import express from "express"
import User from "../models/user.js"
import bcrypt from "bcrypt"
const Route = express.Router()


Route.post("/",async (req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email})
        if(user){
            return res.status(404).send({message:"Email aldready exists"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password,salt)
        const savedUser = await new User({...req.body,password:hashPassword}).save()
        console.log(savedUser)
        res.status(201).send({message:"User created successfully!"})
    } catch (error) {
        console.log("Internal Server error")
    }
})
export default Route