import mongoose from "mongoose";
import { SUPPORTED_LANGUAGES } from "../../config/i18n.js";

const categoryTranslationSchema = new mongoose.Schema(
    {
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        language: {
            type: String,
            enum: SUPPORTED_LANGUAGES,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
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

categoryTranslationSchema.index({ category_id: 1, language: 1 }, { unique: true });
categoryTranslationSchema.index({ language: 1, updated_at: -1 });

export default mongoose.model("CategoryTranslation", categoryTranslationSchema);
