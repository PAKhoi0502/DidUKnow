import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../modules/user/user.model.js";
import { hashPassword } from "../utils/hashPassword.js";

dotenv.config();

const seedUsers = [
    {
        username: "user",
        email: "user@gmail.com",
        role_id: "69b135aa43dcf8b29d934899",
        password: "user123",
        language: "en"
    },
    {
        username: "admin",
        email: "admin@gmail.com",
        role_id: "69b1492e43dcf8b29d93489d",
        password: "admin123",
        language: "en"
    },
    {
        username: "editor",
        email: "editor@gmail.com",
        role_id: "69b1495143dcf8b29d9348a0",
        password: "editor123",
        language: "en"
    }
];

const run = async () => {
    try {
        await connectDB();

        const operations = await Promise.all(
            seedUsers.map(async (user) => {
                const password_hash = await hashPassword(user.password);

                return {
                    updateOne: {
                        filter: { email: user.email },
                        update: {
                            $set: {
                                username: user.username,
                                email: user.email,
                                role_id: new mongoose.Types.ObjectId(user.role_id),
                                password_hash,
                                language: user.language,
                                status: "active"
                            }
                        },
                        upsert: true
                    }
                };
            })
        );

        const result = await User.bulkWrite(operations);
        console.log("Seed users completed", {
            matched: result.matchedCount,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });
    } catch (error) {
        console.error("Seed users failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
