const express = require("express");
const axios = require("axios");
const router = express.Router();
const db = require("../config/db");
const { loginWithAuth0 } = require("../services/auth0Service");

router.post("/login", async (req, res) => {
    const { email: loginIdentifier, password } = req.body;

    let emailToUse = loginIdentifier;

    if (!loginIdentifier.includes("@")) {
        try {
            const result = await db.query("SELECT email FROM users WHERE username = $1", [loginIdentifier]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "No user found with that username" });
            }
            emailToUse = result.rows[0].email;
        } catch (err) {
            console.error("Failed to look up email from username:", err.message);
            return res.status(500).json({ error: "Login failed", details: err.message });
        }
    }

    const result = await loginWithAuth0(emailToUse, password);

    if (result.error) {
        return res.status(401).json(result);
    }

    try {
        const userRes = await db.query("SELECT * FROM users WHERE email = $1", [emailToUse]);
        if (userRes.rowCount === 0) {
            return res.status(403).json({ error: "Auth0 login succeeded, but user not found in DB" });
        }

        return res.json({
            ...result,        // Auth0 tokens
            user: userRes.rows[0],  // Your DB info
        });

    } catch (err) {
        console.error("DB user check failed:", err.message);
        return res.status(500).json({ error: "Login failed", details: err.message });
    }
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
