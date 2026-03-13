import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

tagSchema.index({ created_at: -1 });

export default mongoose.model("Tag", tagSchema);
