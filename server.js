require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db.js");
const userRouter = require("./routes/user.router.js");
const authRouter = require("./routes/auth.router.js");
const profileRouter = require("./routes/profile.router.js");
const postRouter = require("./routes/posts.router.js");

const app = express();

connectDB();

//middleware

app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("working");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/posts", postRouter);

app.listen(PORT, () => console.log("GOOD 2 GO ON PORT: " + PORT));
