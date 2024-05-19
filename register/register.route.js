var express = require("express");
var router = express.Router();
const { z } = require("zod");
const { findUserByEmail, createUser } = require("../user/user.service");
const { createRefreshToken } = require("../auth/auth.service");
const { generateAccessToken, generateRefreshToken } = require("../lib/jwt");

const RegisterSchema = z.object({
  body: z.object({
    name: z.string().max(255).min(3),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error) {
    return res.status(400).json({ validations: error.errors });
  }
};

router.post("/", validate(RegisterSchema), async (req, res, next) => {
  try {
    const userExists = await findUserByEmail(req.body.email);
    if (userExists)
      return res.status(400).json({
        error: {
          message: `User with email ${email} is exists.`,
        },
      });

    const user = await createUser(req.body);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    createRefreshToken(user.id, refreshToken, req.user_agent);

    res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
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

module.exports = router;
