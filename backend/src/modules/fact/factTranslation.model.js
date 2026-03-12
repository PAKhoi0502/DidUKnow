import mongoose from "mongoose";
import { SUPPORTED_LANGUAGES } from "../../config/i18n.js";

const factTranslationContentImageSchema = new mongoose.Schema(
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

const factTranslationContentSchema = new mongoose.Schema(
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
            type: [factTranslationContentImageSchema],
            default: []
        }
    },
    {
        _id: false
    }
);

const factTranslationSchema = new mongoose.Schema(
    {
        fact_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fact",
            required: true
        },
        language: {
            type: String,
            enum: SUPPORTED_LANGUAGES,
            required: true
        },
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
            type: factTranslationContentSchema,
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

factTranslationSchema.index({ fact_id: 1, language: 1 }, { unique: true });
factTranslationSchema.index({ language: 1, updated_at: -1 });

export default mongoose.model("FactTranslation", factTranslationSchema);
