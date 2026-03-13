import mongoose from "mongoose";

const collectionFactSchema = new mongoose.Schema(
    {
        collection_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BookmarkCollection",
            required: true
        },
        fact_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fact",
            required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false
        }
    }
);

collectionFactSchema.index({ collection_id: 1, fact_id: 1 }, { unique: true });
collectionFactSchema.index({ fact_id: 1, created_at: -1 });
collectionFactSchema.index({ collection_id: 1, created_at: -1 });

export default mongoose.model("CollectionFact", collectionFactSchema);
