var express = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const {
  createRefreshToken,
  updateRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
} = require("./auth.service");
const { findUserByEmail, findUserById } = require("../user/user.service");
const { generateAccessToken, generateRefreshToken } = require("../lib/jwt");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware");

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
    });

    next();
  } catch (error) {
    return res.status(400).json({ validations: error.errors });
  }
};

router.post("/", validate(LoginSchema), async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        error: `Username or password you entered doesn't match with our records.`,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: `Username or password you entered doesn't match with our records.`,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await createRefreshToken(user.id, refreshToken, req.user_agent);

    res.cookie("keepm_refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    res.status(500).json({ errors: error });
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  const refreshToken = req.cookies.keepm_refresh_token;
  if (!refreshToken) {
    return res.status(400).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await findUserById(decoded.userId);
    const currentRefreshToken = await getRefreshToken(
      decoded.userId,
      refreshToken,
      req.user_agent
    );

    if (
      !user ||
      !currentRefreshToken ||
      currentRefreshToken.token !== refreshToken
    ) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await updateRefreshToken(
      user.id,
      refreshToken,
      newRefreshToken,
      req.user_agent
    );

    res.cookie("keepm_refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
    next(error);
  }
});

router.post("/revoke-token", verifyToken, async (req, res, next) => {
  const refreshToken = req.cookies.keepm_refresh_token;
  if (!refreshToken) {
    return res.status(400).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await deleteRefreshToken(decoded.id, refreshToken, req.user_agent);

    res.clearCookie("keepm_refresh_token");
    res.status(200).json({ message: "Successfully logout" });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
    next(error);
  }
});

module.exports = router;
