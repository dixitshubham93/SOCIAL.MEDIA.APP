import {v2 as cloudinary} from "cloudinary"
import fs from "fs";
cloudinary.config(
  {
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
  }
)
const uploadToCloudinary=async function(localFilePath){
  try {
    const response= await cloudinary.uploader.upload(localFilePath)
    fs.unlinkSync(localFilePath)
    return response.url
  } catch (error) {
    fs.unlinkSync(localFilePath) 
    console.log(`failed to upload to the cloudinary-----${error}`) 
  }

}
export {uploadToCloudinary}