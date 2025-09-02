import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CROS_ORIGIN,
    credentials: true

}))

app.use(express.json({
    limit: "20kb"
}))
app.use(express.urlencoded({
    extented: true,
    limit: "20kb"
}))
app.use(express.static("public"))

app.use(cookieParser())



//routes

import router from "./Routes/User.routes.js";

//routes declaration

app.use("/api/v1/users", router)



export { app };
