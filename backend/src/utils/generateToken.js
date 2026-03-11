import crypto from "crypto";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const encodeBase64Url = (value) => {
    return Buffer.from(value)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
};

const decodeBase64Url = (value) => {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    if (padding) {
        base64 += "=".repeat(4 - padding);
    }
    return Buffer.from(base64, "base64").toString("utf-8");
};

const sign = (payloadPart, secret) => {
    return crypto
        .createHmac("sha256", secret)
        .update(payloadPart)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
};

export const generateAccessToken = (payload) => {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const body = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
    };
    const payloadPart = encodeBase64Url(JSON.stringify(body));
    const signature = sign(payloadPart, secret);
    return `${payloadPart}.${signature}`;
};

export const verifyAccessToken = (token) => {
    if (!token || typeof token !== "string" || !token.includes(".")) {
        return null;
    }

    const [payloadPart, signature] = token.split(".");
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const expectedSignature = sign(payloadPart, secret);

    if (signature !== expectedSignature) {
        return null;
    }

    try {
        const payload = JSON.parse(decodeBase64Url(payloadPart));
        if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
};
