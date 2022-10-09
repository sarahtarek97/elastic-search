const express = require("express");
const app = express();
const routes = require("./routes");
const bodyParser = require("body-parser");

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", routes);

app.listen(port, () => console.log("server is running"));
