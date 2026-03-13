import crypto from "node:crypto";
import mongoose from "mongoose";
import FactView from "./factView.model.js";
import { createHttpError } from "../../utils/httpError.js";

const toViewDate = (date = new Date()) => {
    return date.toISOString().slice(0, 10);
};

const toObjectId = (value) => {
    return new mongoose.Types.ObjectId(value);
};

export const hashIpAddress = (ipAddress) => {
    if (typeof ipAddress !== "string" || ipAddress.trim().length === 0) {
        return null;
    }

    return crypto
        .createHash("sha256")
        .update(ipAddress.trim())
        .digest("hex");
};

export const recordFactView = async ({ factId, userId = null, ipAddress = null }) => {
    if (!mongoose.Types.ObjectId.isValid(factId)) {
        throw createHttpError(400, "errors.fact_id_invalid");
    }

    const normalizedUserId = userId && mongoose.Types.ObjectId.isValid(userId)
        ? userId
        : null;

    const ipHash = hashIpAddress(ipAddress);

    await FactView.create({
        fact_id: factId,
        user_id: normalizedUserId,
        ip_hash: ipHash,
        view_date: toViewDate()
    });
};

const parseOptionalDate = (rawValue) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") {
        return null;
    }

    const parsed = new Date(String(rawValue));
    if (Number.isNaN(parsed.getTime())) {
        throw createHttpError(400, "errors.date_invalid");
    }

    return parsed;
};

export const getFactViewSummaryByFactId = async (factId, query = {}) => {
    if (!mongoose.Types.ObjectId.isValid(factId)) {
        throw createHttpError(400, "errors.fact_id_invalid");
    }

    const fromDate = parseOptionalDate(query.from);
    const toDate = parseOptionalDate(query.to);

    if (fromDate && toDate && fromDate > toDate) {
        throw createHttpError(400, "errors.date_range_invalid");
    }

    const match = {
        fact_id: toObjectId(factId)
    };

    if (fromDate || toDate) {
        match.created_at = {};
        if (fromDate) {
            match.created_at.$gte = fromDate;
        }
        if (toDate) {
            match.created_at.$lte = toDate;
        }
    }

    const [totals] = await FactView.aggregate([
        { $match: match },
        {
            $group: {
                _id: "$fact_id",
                total_views: { $sum: 1 },
                unique_users_set: { $addToSet: "$user_id" },
                unique_guests_set: { $addToSet: "$ip_hash" }
            }
        },
        {
            $project: {
                _id: 0,
                total_views: 1,
                unique_users: {
                    $size: {
                        $filter: {
                            input: "$unique_users_set",
                            as: "userId",
                            cond: { $ne: ["$$userId", null] }
                        }
                    }
                },
                unique_guests: {
                    $size: {
                        $filter: {
                            input: "$unique_guests_set",
                            as: "ipHash",
                            cond: { $ne: ["$$ipHash", null] }
                        }
                    }
                }
            }
        }
    ]);

    const byDate = await FactView.aggregate([
        { $match: match },
        {
            $group: {
                _id: "$view_date",
                views: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                views: 1
            }
        },
        { $sort: { date: 1 } }
    ]);

    const totalViews = totals?.total_views ?? 0;
    const uniqueUsers = totals?.unique_users ?? 0;
    const uniqueGuests = totals?.unique_guests ?? 0;

    return {
        fact_id: factId,
        total_views: totalViews,
        unique_users: uniqueUsers,
        unique_guests: uniqueGuests,
        unique_viewers: uniqueUsers + uniqueGuests,
        by_date: byDate
    };
};
