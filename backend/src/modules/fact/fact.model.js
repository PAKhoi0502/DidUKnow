import mongoose from "mongoose";

const factContentImageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true
        },
        alt: {
            type: String,
            default: null
        },
        caption: {
            type: String,
            default: null
        }
    },
    {
        _id: false
    }
);

const factContentSchema = new mongoose.Schema(
    {
        intro: {
            type: String,
            required: true,
            trim: true
        },
        body: {
            type: String,
            required: true,
            trim: true
        },
        conclusion: {
            type: String,
            required: true,
            trim: true
        },
        images: {
            type: [factContentImageSchema],
            default: []
        }
    },
    {
        _id: false
    }
);

const factSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        short_fact: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: factContentSchema,
            required: true
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

factSchema.index({ status: 1, created_at: -1 });
factSchema.index({ category_id: 1, status: 1, created_at: -1 });
factSchema.index({ title: "text", short_fact: "text" });

export default mongoose.model("Fact", factSchema);
