import asyncHandler from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import { verification } from "../middlewares/verification.middlerware.js";
import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/ApiResponse.utils.js";

/*steps for registering a user
1. make a request to the server 
2. recieve the files by multer middle ware and check  if they are valid
3. check field validation
4. check if the user is already exist or not
5. upload the files to cloudinary
6. save the user in the database and get response
7. send response to the server by removing the password id and refresh token*/

// Registration controller
//validation
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  if (!username || !email || !password || !fullName) {
    throw new ApiError("all field are must required", 400);
  }

  console.log(req.body);
  //checking in database  if user is already exist or not
  let user = await User.findOne({ $or: [{ email }, { username }] });
  // Because we are using $or this will return a object email or username is matched {$and,$nor }
  if (user) {
    throw new ApiError(
      `user with this email or username is exist ${user}`,
      409
    );
  }

  //checking if images are valid or not
  console.log(req.files);

  const avatar = req.files?.avatar?.[0]?.path;
  let coverImage = req.files?.coverImage?.[0]?.path || "";

  if (!avatar) {
    throw new ApiError("avatar file is required", 400);
  }

  // uploading to cloudinary and accepting url ;
  let coverImage_url = "";
  const avatar_url = await uploadToCloudinary(avatar);
  if (coverImage) {
    coverImage_url = await uploadToCloudinary(coverImage);
  }
  console.log(
    "images succesfully uploaded to cloudinary and these are the url:---"
  );
  console.log(avatar_url);
  console.log(coverImage);

  //saving the user in the database and getting a response
  const response = await User.create({
    avatar: avatar_url,
    coverImage: coverImage_url,
    fullName,
    email,
    username,
    password,
  });
  console.log("user is saved in the database succesfully");
  console.log(response);
  res.status(201).json({ message: "User created successfully", response });
});

//login controller

//steps
// get password and email from the throw req.body
// find user by this cradential
// create jwt token and send to user and save it in data base
// and send res which you want to send or any access

const loginController = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError("body is not exist", 401);
  }
  const UserEmail = req.body.email;
  console.log(`this the user body ${req.body}`);

  if (!req.body.email) {
    throw new ApiError(`Incorect user email ${UserEmail}`, 401);
  }
  const UserPassword = req.body.password;
  const user = await User.findOne({ email: UserEmail });
  if (!user) {
    throw new ApiError("User with this email doesn't  exist", 403);
  }
  console.log(user);
  if (!UserPassword) {
    throw new ApiError("Password must be required");
  }
  const isvalidpassword = await user.isPasswordCorrect(UserPassword)
  if (!isvalidpassword) {
    throw new ApiError("Password incorrect", 403);
  }
  const AccessToken = await user.generateAccessToken();
  const RefreshToken = await user.generateRefreshToken();

  user.refreshToken = RefreshToken;
  await user.save();

  const options = {
    httpOnly: true,
    secure: true, // `Secure` should be lowercase `secure`
  };

  res
    .status(200)
    .cookie("accessToken", AccessToken, options) // Correct syntax for setting cookies
    .cookie("refreshToken", RefreshToken, options) // Correct syntax for setting cookies
    .json({ message: "User logged in successfully" });
});

// Logout controller

const logoutController = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { refreshToken: null },
        { new: true }
    );
    const options={
        httpOnly: true,
        secure:true
    }
  res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json({ message: "User loggout in successfully" })
});

// RefreshToken end point

const RegenrateTokens = asyncHandler(async(req,res)=>{

  const refreshToken = req.cookies?.refreshToken||req.body.refreshToken

  if(!refreshToken)
    {throw new ApiError("refreshToken can't be empty ",401)}

  try {
    const decodedRawRefreshToken =  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedRawRefreshToken._id)
    if(refreshToken!==user.refreshToken){throw new ApiError("Refresh Token is expired",403)}
  
    const newAccessToken = user.generateAccessToken();
    const newrefreshToken = user.generateRefreshToken();
  
    user.refreshToken = newrefreshToken
    const result = await User.updateOne(
      { _id: user._id }, // Filter: find the user by ID
      { $set: { refreshToken: newrefreshToken } } // Update the refreshToken field
    );

  
    const options = {
                    httpOnly : true,
                    secure   : true
    }
    
    res
    .status(201)
    .cookie("accessToken", newAccessToken)
    .cookie("refreshToken", newrefreshToken)
    .json(
      new ApiResponse(
        "successful",
        200,
        {
          message : "New genrated succesfully"
        }
      )
  )
  } catch (error) {
    throw new ApiError(error)
  }


})

export { registerUser, loginController, logoutController,RegenrateTokens };
