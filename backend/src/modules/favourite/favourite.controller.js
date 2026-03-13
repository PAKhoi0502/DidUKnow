import {
    addFavourite,
    checkFavouriteByFactId,
    getFavouriteList,
    removeFavouriteByFactId
} from "./favourite.service.js";

export const createFavouriteController = async (req, res, next) => {
    try {
        const favourite = await addFavourite(req.user.id, req.validatedBody.fact_id);
        return res.status(201).json({
            message: "favourites.create_success",
            data: favourite
        });
    } catch (error) {
        return next(error);
    }
};

export const getFavouritesController = async (req, res, next) => {
    try {
        const favourites = await getFavouriteList(req.user.id, req.query);
        return res.status(200).json({
            message: "favourites.get_success",
            data: favourites
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteFavouriteByFactIdController = async (req, res, next) => {
    try {
        const favourite = await removeFavouriteByFactId(req.user.id, req.params.fact_id);
        return res.status(200).json({
            message: "favourites.delete_success",
            data: favourite
        });
    } catch (error) {
        return next(error);
    }
};

export const checkFavouriteByFactIdController = async (req, res, next) => {
    try {
        const result = await checkFavouriteByFactId(req.user.id, req.params.fact_id);
        return res.status(200).json({
            message: "favourites.check_success",
            data: result
        });
    } catch (error) {
        return next(error);
    }
};
