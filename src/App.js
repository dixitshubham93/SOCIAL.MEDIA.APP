import express from "express";
import userRouter from  "./routes/user.route.js";

const app = express();

app.use(express.json({limit: "16kb"}));

app.use("/user",userRouter)

export { app };
