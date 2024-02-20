import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./db.js";
import { Router } from "./src/Routes/index.js";
//configuring dotenv
dotenv.config();
//initializing port
const PORT=process.env.PORT;
//initializing server
const app=express();
//middlewares
app.use(express.json());
app.use(cors());
//connecting database
dbConnect();
//adding router
app.use("/",Router);
//listening to the server
app.listen(PORT,()=>console.log("Server started in Port : "+PORT));
