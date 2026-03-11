import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.listen(3000, () => {
    console.log("Server running");
});