import {
    createBookmarkCollection,
    deleteMyBookmarkCollectionById,
    getMyBookmarkCollectionById,
    getMyBookmarkCollections,
    updateMyBookmarkCollectionById
} from "./bookmarkCollection.service.js";

export const createBookmarkCollectionController = async (req, res, next) => {
    try {
        const collection = await createBookmarkCollection(req.user.id, req.validatedBody);
        return res.status(201).json({
            message: "bookmark_collections.create_success",
            data: collection
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyBookmarkCollectionsController = async (req, res, next) => {
    try {
        const collections = await getMyBookmarkCollections(req.user.id, req.query);
        return res.status(200).json({
            message: "bookmark_collections.get_success",
            data: collections
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyBookmarkCollectionByIdController = async (req, res, next) => {
    try {
        const collection = await getMyBookmarkCollectionById(req.params.id, req.user.id);
        return res.status(200).json({
            message: "bookmark_collections.get_by_id_success",
            data: collection
        });
    } catch (error) {
        return next(error);
    }
};

export const updateMyBookmarkCollectionController = async (req, res, next) => {
    try {
        const collection = await updateMyBookmarkCollectionById(req.params.id, req.user.id, req.validatedBody);
        return res.status(200).json({
            message: "bookmark_collections.update_success",
            data: collection
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteMyBookmarkCollectionController = async (req, res, next) => {
    try {
        const collection = await deleteMyBookmarkCollectionById(req.params.id, req.user.id);
        return res.status(200).json({
            message: "bookmark_collections.delete_success",
            data: collection
        });
    } catch (error) {
        return next(error);
    }
};
