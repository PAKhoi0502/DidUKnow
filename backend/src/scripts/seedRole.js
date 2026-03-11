import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Role from "../modules/role/role.model.js";

dotenv.config();

const seedRoles = [
    {
        name: "User",
        description: "Standard user role",
        status: "active"
    },
    {
        name: "Admin",
        description: "Administrator role",
        status: "active"
    },
    {
        name: "Editor",
        description: "Content editor role",
        status: "active"
    }
];

const run = async () => {
    try {
        await connectDB();

        const operations = seedRoles.map((role) => ({
            updateOne: {
                filter: { name: role.name },
                update: {
                    $set: {
                        name: role.name,
                        description: role.description,
                        status: role.status
                    }
                },
                upsert: true
            }
        }));

        const result = await Role.bulkWrite(operations);
        console.log("Seed roles completed", {
            matched: result.matchedCount,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });
    } catch (error) {
        console.error("Seed roles failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
