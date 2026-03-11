import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../modules/user/user.model.js";
import Role from "../modules/role/role.model.js";
import { hashPassword } from "../utils/hashPassword.js";

dotenv.config();

const run = async () => {
    try {
        await connectDB();

        const editorRole = await Role.findOne({
            name: { $regex: /^editor$/i }
        })
            .select("_id")
            .lean();

        if (!editorRole) {
            throw new Error("Role 'Editor' not found. Run seed:roles first.");
        }

        const passwordHash = await hashPassword("editor123");
        const user = await User.findOneAndUpdate(
            { email: "editor@gmail.com" },
            {
                $set: {
                    username: "editor",
                    email: "editor@gmail.com",
                    role_id: editorRole._id,
                    password_hash: passwordHash,
                    language: "en",
                    status: "active"
                }
            },
            { upsert: true, new: true }
        ).lean();

        console.log("Seed editor completed", {
            user_id: user?._id?.toString() ?? null,
            email: user?.email ?? "editor@gmail.com"
        });
    } catch (error) {
        console.error("Seed editor failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
