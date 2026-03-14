import {
    createReportFact,
    getAllReportFacts,
    getReportFactById,
    getMyReportFacts,
    updateReportFactStatusById
} from "./reportFact.service.js";

export const createReportFactController = async (req, res, next) => {
    try {
        const report = await createReportFact(req.user.id, req.validatedBody);
        return res.status(201).json({
            message: "report_facts.create_success",
            data: report
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyReportFactsController = async (req, res, next) => {
    try {
        const reports = await getMyReportFacts(req.user.id, req.query);
        return res.status(200).json({
            message: "report_facts.get_my_success",
            data: reports
        });
    } catch (error) {
        return next(error);
    }
};

export const getAllReportFactsController = async (req, res, next) => {
    try {
        const reports = await getAllReportFacts(req.query);
        return res.status(200).json({
            message: "report_facts.get_success",
            data: reports
        });
    } catch (error) {
        return next(error);
    }
};

export const updateReportFactStatusController = async (req, res, next) => {
    try {
        const report = await updateReportFactStatusById(req.params.id, req.validatedBody, req.user.id);
        return res.status(200).json({
            message: "report_facts.update_status_success",
            data: report
        });
    } catch (error) {
        return next(error);
    }
};

export const getReportFactByIdController = async (req, res, next) => {
    try {
        const report = await getReportFactById(req.params.id);
        return res.status(200).json({
            message: "report_facts.get_by_id_success",
            data: report
        });
    } catch (error) {
        return next(error);
    }
};
