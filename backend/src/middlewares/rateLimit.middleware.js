import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const buildRateLimitResponse = (message) => {
    return {
        message
    };
};

const parseRequiredPositiveInt = (envName) => {
    const rawValue = process.env[envName];
    const parsed = Number.parseInt(rawValue, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid environment variable: ${envName} must be a positive integer`);
    }

    return parsed;
};

const CREATE_USER_RATE_LIMIT_WINDOW_MS = parseRequiredPositiveInt("CREATE_USER_RATE_LIMIT_WINDOW_MS");
const CREATE_USER_RATE_LIMIT_MAX = parseRequiredPositiveInt("CREATE_USER_RATE_LIMIT_MAX");
const LOGIN_RATE_LIMIT_WINDOW_MS = parseRequiredPositiveInt("LOGIN_RATE_LIMIT_WINDOW_MS");
const LOGIN_RATE_LIMIT_MAX = parseRequiredPositiveInt("LOGIN_RATE_LIMIT_MAX");
const LOGIN_ACCOUNT_RATE_LIMIT_WINDOW_MS = parseRequiredPositiveInt("LOGIN_ACCOUNT_RATE_LIMIT_WINDOW_MS");
const LOGIN_ACCOUNT_RATE_LIMIT_MAX = parseRequiredPositiveInt("LOGIN_ACCOUNT_RATE_LIMIT_MAX");

export const createUserRateLimit = rateLimit({
    windowMs: CREATE_USER_RATE_LIMIT_WINDOW_MS,
    max: CREATE_USER_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: buildRateLimitResponse("errors.rate_limit_create_user")
});

export const loginIpRateLimit = rateLimit({
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
    max: LOGIN_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: buildRateLimitResponse("errors.rate_limit_login_ip")
});

export const loginAccountRateLimit = rateLimit({
    windowMs: LOGIN_ACCOUNT_RATE_LIMIT_WINDOW_MS,
    max: LOGIN_ACCOUNT_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.email;
        if (typeof email === "string" && email.trim().length > 0) {
            return `login_email:${email.trim().toLowerCase()}`;
        }
        return `login_ip_fallback:${ipKeyGenerator(req.ip)}`;
    },
    message: buildRateLimitResponse("errors.rate_limit_login_account")
});
