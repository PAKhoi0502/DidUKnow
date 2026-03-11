import jwt from "jsonwebtoken";

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is required");
    }
    return secret;
};

const getJwtExpiresIn = () => {
    return process.env.JWT_EXPIRES_IN || "7d";
};

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: getJwtExpiresIn()
    });
};

export const verifyAccessToken = (token) => {
    if (!token || typeof token !== "string") {
        return null;
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        return decoded && typeof decoded === "object" ? decoded : null;
    } catch (error) {
        return null;
    }
};
