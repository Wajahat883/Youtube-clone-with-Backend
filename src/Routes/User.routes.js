import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutuser, refrehAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage } from "../Controllers/User.controller.js";
import { upload} from "../Middlewares/multer.middleware.js" 
import { verifyJwt } from "../Middlewares/auth.middleware.js";
const router = Router()

router.post("/register", upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]), registerUser);

router.route("/login").post(loginUser)

//Secured routes
router.route("/logout").post(verifyJwt,logOutuser)
router.route("/refresh").post(refrehAccessToken)
router.route("/change-password").post(verifyJwt,changeCurrentPassword)
router.route("/change-user").post(verifyJwt,getCurrentUser)
router.route("/update-account").patch(verifyJwt,updateAccountDetails)
router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(verifyJwt,upload.single("coverImage"),updateUsercoverImage)
router.route("/c/:username").get(verifyJwt,getUserChannelProfile)
router.route("/history").get(verifyJwt,getWatchHistory)


export default router;