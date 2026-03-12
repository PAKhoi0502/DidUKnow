import mongoose from "mongoose";
import { SUPPORTED_LANGUAGES } from "../../config/i18n.js";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password_hash: {
            type: String,
            required: true
        },

        avatar_url: {
            type: String,
            default: null
        },

        language: {
            type: String,
            enum: SUPPORTED_LANGUAGES,
            default: "en"
        },

        status: {
            type: String,
            enum: ["active", "inactive", "banned"],
            default: "active"
        },

        email_verified_at: {
            type: Date,
            default: null
        },

        last_login_at: {
            type: Date,
            default: null
        },

        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        }

    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

export default mongoose.model("User", userSchema);