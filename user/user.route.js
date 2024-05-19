var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.send("User Response");
});

router.get("/session", async (req, res) => {
  try {
    res.json(req.payload);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
