const express = require("express");
const mongoose = require("mongoose");

const routes = require("./routes");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use("/api", routes);

module.exports = app;