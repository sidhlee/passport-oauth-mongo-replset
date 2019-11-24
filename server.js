"use strict";
require("dotenv").config();

const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const auth = require("./auth");
const routes = require("./routes");

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));
app.set("view engine", "pug");

MongoClient.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(client => {
    console.log("connected to db");
    const db = client.db(process.env.DB_NAME);

    auth(app, db);
    routes(app, db);

    app.listen(process.env.PORT || 2000, () => {
      console.log(`Listening on port: ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));
