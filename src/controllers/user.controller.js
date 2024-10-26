import asyncHandler from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import {User} from '../models/user.models.js'
import {uploadToCloudinary} from "../utils/cloudinary.utils.js"
/*steps for registering a user
1. make a request to the server 
2. recieve the files by multer middle ware and check  if they are valid
3. check field validation
4. check if the user is already exist or not
5. upload the files to cloudinary
6. save the user in the database and get response
7. send response to the server by removing the password id and refresh token*/

//validation
const registerUser = asyncHandler( async(req,res)=>{
   
    const {username,email,password,fullName}= req.body

    if(!username||!email||!password||!fullName){
        throw new ApiError("all field are must required",400) ;
     }

    console.log(req.body)
//checking in database  if user is already exist or not
   let user = await User.findOne({$or:[{email},{username}]})
                                                         // Because we are using $or this will return a object email or username is matched {$and,$nor }
   if(user){
    throw new ApiError(`user with this email or username is exist ${user}`,409)};

//checking if images are valid or not
console.log(req.files)

const avatar = req.files?.avatar?.[0]?.path;
let coverImage = req.files?.coverImage?.[0]?.path||"";

if(!avatar)
    {
        throw new ApiError("avatar file is required",400)
    }
    
    // uploading to cloudinary and accepting url ;
    let coverImage_url= "";
    const avatar_url = await uploadToCloudinary(avatar)
    if(coverImage){ coverImage_url = await uploadToCloudinary(coverImage)}
    console.log("images succesfully uploaded to cloudinary and these are the url:---")
    console.log(avatar_url)
    console.log(coverImage)

    //saving the user in the database and getting a response
     const response = await User.create(
       {
        avatar:avatar_url,
        coverImage:coverImage_url,
        fullName,
        email,
        username,
        password
       } 
    )
    console.log("user is saved in the database succesfully")
    console.log(res);
    res.status(201).json({ message: 'User created successfully', response });
  
})

export {registerUser};