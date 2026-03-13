import mongoose from "mongoose";

const bookmarkCollectionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

bookmarkCollectionSchema.index({ user_id: 1, created_at: -1 });
bookmarkCollectionSchema.index({ user_id: 1, name: 1 }, { unique: true });

export default mongoose.model("BookmarkCollection", bookmarkCollectionSchema);
