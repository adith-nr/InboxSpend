import mongoose from "mongoose";
import jwt from "jsonwebtoken"
const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    appPass:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true})

UserSchema.methods.genAuthToken=function(){
    const token = jwt.sign({
        id:this._id
    },
    process.env.JWT_SECRET,{expiresIn:"1h"})
    return token
}
const User = mongoose.model("User",UserSchema)
export default User