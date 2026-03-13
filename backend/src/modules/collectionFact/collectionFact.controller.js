import {
    addFactToCollection,
    getCollectionFacts,
    removeFactFromCollection
} from "./collectionFact.service.js";

export const createCollectionFactController = async (req, res, next) => {
    try {
        const item = await addFactToCollection(req.user.id, req.validatedBody);
        return res.status(201).json({
            message: "collection_facts.create_success",
            data: item
        });
    } catch (error) {
        return next(error);
    }
};

export const getCollectionFactsController = async (req, res, next) => {
    try {
        const result = await getCollectionFacts(req.params.collection_id, req.user.id, req.query);
        return res.status(200).json({
            message: "collection_facts.get_success",
            data: result
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteCollectionFactController = async (req, res, next) => {
    try {
        const item = await removeFactFromCollection(req.params.collection_id, req.params.fact_id, req.user.id);
        return res.status(200).json({
            message: "collection_facts.delete_success",
            data: item
        });
    } catch (error) {
        return next(error);
    }
};
