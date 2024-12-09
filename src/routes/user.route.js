import { Router } from "express";
import { registerUser ,loginController,logoutController,RegenrateTokens} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verification } from "../middlewares/verification.middlerware.js";

const router=Router();
router.route("/register").post(
    upload.fields([
        {name:"avatar",
         maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
router.route("/login").post(loginController)
router.route("/logout").post(verification ,logoutController)
router.route("/generateRf").post(RegenrateTokens)

export default router; 