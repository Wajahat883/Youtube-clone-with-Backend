import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

 cloudinary.config({ 
      
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.Cloudinary_Api_Key, 
        api_secret:process.env.Cloudinary_Api-Secret
    });

    const uploadonCloudinary = async (localFieldpath)=>{
        try {
            if(!localFieldpath) return null;
                 const response = await cloudinary.uploader.upload(localFieldpath,{
            resource_type:"auto"
        })
        // file has been upload successfully
        console.log("File is upload on cloudinary:",response.url);
        return response;
        } catch (error) {
            //remove locally saved temporary file as the upload operation failed 

            fs.unlinkSync(localFieldpath)
            return null
        }

  
    }

    export {uploadonCloudinary}