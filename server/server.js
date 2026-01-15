import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const port = process.env.PORT;
const DB = process.env.DB_LOCAL;

mongoose.connect(DB).then(() => console.log("connected to mongodb"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
