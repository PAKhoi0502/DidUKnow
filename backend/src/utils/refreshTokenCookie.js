export const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "refresh_token";

const isProduction = process.env.NODE_ENV === "production";

const getRefreshCookieMaxAgeMs = () => {
    const raw = process.env.REFRESH_COOKIE_MAX_AGE_MS;
    const parsed = Number.parseInt(raw, 10);

    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
    }

    return 30 * 24 * 60 * 60 * 1000;
};

export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/api/users",
    maxAge: getRefreshCookieMaxAgeMs()
};
