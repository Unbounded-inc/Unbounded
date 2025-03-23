const express = require("express");
const axios = require("axios");
const router = express.Router();
const { loginWithAuth0 } = require("../services/auth0Service");

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const result = await loginWithAuth0(email, password);
    if (result.error) {
        return res.status(401).json(result);
    }
    res.json(result);
});


module.exports = router;
