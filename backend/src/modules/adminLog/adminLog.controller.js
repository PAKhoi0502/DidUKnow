import { getAdminLogList } from "./adminLog.service.js";

export const getAdminLogsController = async (req, res, next) => {
    try {
        const logs = await getAdminLogList(req.query);
        return res.status(200).json({
            message: "admin_logs.get_success",
            data: logs
        });
    } catch (error) {
        return next(error);
    }
};
