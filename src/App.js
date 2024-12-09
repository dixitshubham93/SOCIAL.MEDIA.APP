import express from "express";
import userRouter from  "./routes/user.route.js";
import cookieParser from 'cookie-parser'; 

const app = express();

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'text/plain' })); 

app.use(cookieParser());
app.get("/",(req,res)=>{res.send("<h1>listening started</h1>")});
app.use("/user",userRouter)


export { app };
