const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//config
const PORT = process.env.PORT || 3000;
const dbURI = "mongodb://127.0.0.1/PIA";

//start server
const app = express();
app.listen(PORT, () => {
  console.log(`Server is now running locally at port ${PORT}.`);
});

//establish db connection
mongoose.connect(
  dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.error("An error has occurred while connecting to MongoDB!");
      console.log(err);
    } else {
      console.log("Connected to database successfully.");
    }
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "[MongoDB][ERROR] "));

//set up middleware
app.use(cors());
