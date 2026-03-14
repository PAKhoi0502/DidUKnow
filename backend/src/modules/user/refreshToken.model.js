import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        token_hash: {
            type: String,
            required: true,
            unique: true
        },
        expires_at: {
            type: Date,
            required: true,
            index: true
        },
        revoked_at: {
            type: Date,
            default: null
        },
        replaced_by_token_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RefreshToken",
            default: null
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

refreshTokenSchema.index({ token_hash: 1, revoked_at: 1, expires_at: 1 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
