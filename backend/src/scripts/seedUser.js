import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../modules/user/user.model.js";
import Role from "../modules/role/role.model.js";
import { hashPassword } from "../utils/hashPassword.js";

dotenv.config();

const seedUsers = [
    {
        username: "user",
        email: "user@gmail.com",
        role_name: "user",
        password: "user123",
        language: "en"
    },
    {
        username: "admin",
        email: "admin@gmail.com",
        role_name: "admin",
        password: "admin123",
        language: "en"
    },
    {
        username: "editor",
        email: "editor@gmail.com",
        role_name: "editor",
        password: "editor123",
        language: "en"
    }
];

const run = async () => {
    try {
        await connectDB();
        const roles = await Role.find({}).select("_id name").lean();
        const roleIdByName = new Map(
            roles.map((role) => [String(role.name).trim().toLowerCase(), role._id])
        );

        const operations = await Promise.all(
            seedUsers.map(async (user) => {
                const roleId = roleIdByName.get(String(user.role_name).toLowerCase());
                if (!roleId) {
                    throw new Error(`Role '${user.role_name}' not found. Run seed:roles first.`);
                }

                const password_hash = await hashPassword(user.password);

                return {
                    updateOne: {
                        filter: { email: user.email },
                        update: {
                            $set: {
                                username: user.username,
                                email: user.email,
                                role_id: roleId,
                                language: user.language
                            },
                            $setOnInsert: {
                                password_hash,
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
