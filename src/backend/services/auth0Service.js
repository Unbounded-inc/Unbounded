const axios = require("axios");

async function loginWithAuth0(email, password) {
    try {
        const response = await axios.post(
            `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
            {
                grant_type: "password",
                username: email,
                password: password,
                audience: process.env.AUTH0_AUDIENCE,
                client_id: process.env.AUTH0_CLIENT_ID,
                client_secret: process.env.AUTH0_CLIENT_SECRET,
                scope: "openid profile email",
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        return response.data;
    } catch (err) {
        console.error("Auth0 login failed:", err.response?.data || err.message);
        return {
            error: "Unauthorized",
            details: err.response?.data || err.message,
        };
    }
}

module.exports = { loginWithAuth0 };
