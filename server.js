require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const API_PORT = process.env.REACT_APP_PORT_API;
const app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const cors = require("cors");

const config = require("./config/key");
const controllerPool = require("./controller/pool");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/api/pool", controllerPool);

// launch our backend into a port

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

io.on("connection", (socket) => {
  console.log("new client connected");
  socket.emit("connection", null);
});
