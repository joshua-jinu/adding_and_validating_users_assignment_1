const express = require("express");
const { resolve } = require("path");
const connectDB = require("./connectDB.js");
const userModel = require("./user.model.js");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const app = express();
const port = 3010;
dotenv.config();

app.use(express.static("static"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "pages/index.html"));
});

app.get("/users", async (req, res) => {
  try {
    const users = await userModel.find();
    return res
      .status(200)
      .send({ message: "Users fetched", success: false, users });
  } catch (error) {
    console.log("error in fetching users");
    return res
      .status(500)
      .send({ message: "Internal Server Error", success: false });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, mail, password } = req.body;
    if (!username || !mail || !password) {
      return res
        .status(400)
        .send({ message: "Enter username, mail and password", success: false });
    }
    const userExists = await userModel.findOne({ mail: mail });
    if (userExists) {
      return res
        .status(400)
        .send({ message: "User already exists", success: false });
    }
    bcrypt.hash(password, 10, async function (err, hash) {
      if (err)
        return res
          .status(400)
          .send({ message: "error in hashing password", success: false });
      console.log("password hashed");
      const user = await userModel.create({
        username,
        mail,
        password: hash,
      });
      return res.status(200).send({ message: "User Created", success: true });
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error", success: false });
  }
});

app.listen(port, () => {
  connectDB();
  console.log(`Example app listening at http://localhost:${port}`);
});
