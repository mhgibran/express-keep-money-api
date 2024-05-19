const express = require("express");
const config = require("./config");
const cookieParser = require("cookie-parser");

const app = express();
const port = config.port;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  req.user_agent = req.headers["user-agent"] || "unknown";
  next();
});

const { verifyToken } = require("./middleware");
const registerModule = require("./register/register.route");
const authModule = require("./auth/auth.route");
const userModule = require("./user/user.route");

app.get("/", async (req, res) => {
  res.send("Hello, World!");
});

app.use("/register", registerModule);
app.use("/auth", authModule);
app.use("/user", verifyToken, userModule);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
