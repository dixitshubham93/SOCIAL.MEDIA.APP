import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        },
    fullName:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    avatar:{
        type:String,//coudinary url
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"],
        unique:true
    },
    refreshToken:{
        type:String
    }
},{timestamps:true}
)
userSchema.pre("save",async function (next) {
if(!this.isModified("password")) return next();
this.password = await bcrypt.hash(this.password,10)
next()
})
userSchema.isPasswordCorrect = async function(password){
    return await  bcrypt.compare(this.password , password);
}
const generateAccessToken=function(){
  return  jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN,
        {expiresIn:process.env.ACCESS_TOKEN_EXP}
    )
}
const generateRefreshToken=function(){
    return  jwt.sign(
          {
              _id:this._id,
          },
          process.env.REFRESH_TOKEN,
          {expiresIn:process.env.REFRESH_TOKEN_EXP}
      )
  }
export const User=mongoose.model("User",userSchema)
