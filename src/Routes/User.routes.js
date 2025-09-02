import { Router } from "express";
import { loginUser, logOutuser, refrehAccessToken, registerUser } from "../Controllers/User.controller.js";
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


export default router;