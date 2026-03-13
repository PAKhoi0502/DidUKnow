import {
    createFact,
    deleteFactById,
    getFactById,
    getFactList,
    getRandomFact,
    upsertFactTranslationById,
    updateFactById,
    updateFactStatusById
} from "./fact.service.js";

const getClientIpAddress = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string" && forwardedFor.trim().length > 0) {
        return forwardedFor.split(",")[0].trim();
    }

    if (typeof req.ip === "string" && req.ip.trim().length > 0) {
        return req.ip.trim();
    }

    if (typeof req.socket?.remoteAddress === "string" && req.socket.remoteAddress.trim().length > 0) {
        return req.socket.remoteAddress.trim();
    }

    return null;
};

export const createFactController = async (req, res, next) => {
    try {
        const fact = await createFact(req.validatedBody, req.user.id);
        return res.status(201).json({
            message: "facts.create_success",
            data: fact
        });
    } catch (error) {
        return next(error);
    }
};

export const getFactsController = async (req, res, next) => {
    try {
        const facts = await getFactList(req.query, req.user ?? null, req.language);
        return res.status(200).json({
            message: "facts.get_success",
            data: facts
        });
    } catch (error) {
        return next(error);
    }
};

export const getFactByIdController = async (req, res, next) => {
    try {
        const fact = await getFactById(
            req.params.id,
            req.user ?? null,
            req.language,
            {
                user_id: req.user?.id ?? null,
                ip_address: getClientIpAddress(req)
            }
        );
        return res.status(200).json({
            message: "facts.get_by_id_success",
            data: fact
        });
    } catch (error) {
        return next(error);
    }
};

export const getRandomFactController = async (req, res, next) => {
    try {
        const {
            fact,
            meta
        } = await getRandomFact(
            req.query,
            req.language,
            req.user ?? null,
            {
                user_id: req.user?.id ?? null,
                ip_address: getClientIpAddress(req)
            }
        );

        return res.status(200).json({
            message: "facts.get_random_success",
            data: fact,
            meta
        });
    } catch (error) {
        return next(error);
    }
};

export const updateFactController = async (req, res, next) => {
    try {
        const fact = await updateFactById(req.params.id, req.validatedBody, req.user);
        return res.status(200).json({
            message: "facts.update_success",
            data: fact
        });
    } catch (error) {
        return next(error);
    }
};

export const updateFactStatusController = async (req, res, next) => {
    try {
        const fact = await updateFactStatusById(
            req.params.id,
            req.validatedBody.status,
            req.user,
            req.validatedBody.reason
        );
        return res.status(200).json({
            message: "facts.update_status_success",
            data: fact
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteFactController = async (req, res, next) => {
    try {
        const fact = await deleteFactById(req.params.id, req.user);
        return res.status(200).json({
            message: "facts.delete_success",
            data: fact
        });
    } catch (error) {
        return next(error);
    }
};

export const upsertFactTranslationController = async (req, res, next) => {
    try {
        const translation = await upsertFactTranslationById(
            req.params.id,
            req.params.language,
            req.validatedBody,
            req.user
        );

        return res.status(200).json({
            message: "facts.upsert_translation_success",
            data: translation
        });
    } catch (error) {
        return next(error);
    }
};
