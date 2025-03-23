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

router.post("/register", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const response = await axios.post(
            `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
            {
                client_id: process.env.AUTH0_CLIENT_ID,
                email,
                password,
                connection: "Username-Password-Authentication",
                given_name: firstName,
                family_name: lastName,
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        res.status(201).json({ message: "User created", data: response.data });
    } catch (err) {
        console.error("Auth0 signup failed:", err.response?.data || err.message);
        res.status(400).json({
            error: "Signup failed",
            details: err.response?.data?.message || "Unknown error",
        });
    }
});


module.exports = router;
