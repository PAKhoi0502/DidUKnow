import { getFactViewSummaryByFactId } from "./factView.service.js";

export const getFactViewSummaryByFactIdController = async (req, res, next) => {
    try {
        const summary = await getFactViewSummaryByFactId(req.params.fact_id, req.query);
        return res.status(200).json({
            message: "fact_views.summary_get_success",
            data: summary
        });
    } catch (error) {
        return next(error);
    }
};
