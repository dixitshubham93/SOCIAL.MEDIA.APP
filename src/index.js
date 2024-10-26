import dbconnect from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./App.js";

dotenv.config({
  path: "./.env",
});

dbconnect()
  .then(() => {
    const port =process.env.PORT || 8000
    app.listen(port, () => {
      console.log(`Listening on the port :${port}`);
    });
  })
  .catch(() => {
    console.log("database connection is failed");
  });

// const app=express()
// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
//          app.on("error",(error)=>{console.log("error",error)});
//          throw error;
//     }catch(err){
//           console.log("error:",err)
//           throw err
//     }

// })()    //if ese
// connectDB();
