const express = require("express");
const router = express.Router();

router.post("/list", async (req, res) => {
  console.log("id:", req.body);

  try {
  } catch (error) {
    console.log("--- error of pool list --- :", error);
  }
});

module.exports = router;
