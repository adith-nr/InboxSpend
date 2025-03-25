import express from "express"
import User from "../models/user.js"
import bcrypt from "bcrypt"
const Route = express.Router()

Route.post("/",async (req,res)=>{
   try {
        const user = await User.findOne({email:req.body.email})
        if(!user){
            return res.status(404).send({message:"User Not found"})
        }
        const validPassword = await bcrypt.compare(req.body.password,user.password)
        if(!validPassword){
            return res.status(401).send({message:"Invalid Email or password"})
        }
        const token = user.genAuthToken()
        res.status(200).send({token,message:"User logged in successfully"})

   } catch (error) {
        res.status(500).send({message:"Internal Server Error"})
   }
})
export default Route