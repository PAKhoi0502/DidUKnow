import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const getRequiredPositiveIntEnv = (envName) => {
    const rawValue = process.env[envName];
    const parsed = Number.parseInt(rawValue, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid environment variable: ${envName} must be a positive integer`);
    }

    return parsed;
};

const validateRequiredEnv = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing required environment variable: JWT_SECRET");
    }
    if (!process.env.JWT_EXPIRES_IN) {
        throw new Error("Missing required environment variable: JWT_EXPIRES_IN");
    }

    getRequiredPositiveIntEnv("LOGIN_RATE_LIMIT_MAX");
    getRequiredPositiveIntEnv("LOGIN_RATE_LIMIT_WINDOW_MS");
    getRequiredPositiveIntEnv("LOGIN_ACCOUNT_RATE_LIMIT_MAX");
    getRequiredPositiveIntEnv("LOGIN_ACCOUNT_RATE_LIMIT_WINDOW_MS");
    getRequiredPositiveIntEnv("CREATE_USER_RATE_LIMIT_MAX");
    getRequiredPositiveIntEnv("CREATE_USER_RATE_LIMIT_WINDOW_MS");
};

try {
    validateRequiredEnv();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const { default: app } = await import("./app.js");

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api-docs/`);
});