import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../Models/User.models.js";
import { uploadonCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const genrateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.genrateAccessToken()
        const refreshToken = await user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {
            accessToken, refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "something went wrong while genrating refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    console.log("REQ FILES:", req.files);
    console.log("REQ BODY:", req.body);
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadonCloudinary(avatarLocalpath);
    const coverImage = await uploadonCloudinary(coverImageLocalpath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file not uploaded");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    //req body ->data
    //username or email
    //find the user 
    //password check 
    //refreshtoken assess token 
    //send in cookies
    //return res

    const { email, username, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "Api does't exit")
    }
    const isPasswordvalid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "invalid user credential")
    }
    const { accessToken, refreshToken } = await
        genrateAccessandRefreshToken(user._id)


    const logedInuser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("access Token",
        accessToken, options
    ).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200,
        {
            user: loginUser, accessToken, refreshToken
        },
        "User logged in Successfully!"
    ))






})
const logOutuser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined,
        }
    }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.statuss(200).clearCookie("accessToken", option)
        .clearCookie("accessToken", option).json(new ApiResponse(200, {}, "User logged out"))
})

export { registerUser, loginUser, logOutuser };
