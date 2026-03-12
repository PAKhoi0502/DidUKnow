import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../modules/category/category.model.js";
import CategoryTranslation from "../modules/category/categoryTranslation.model.js";
import { DEFAULT_LANGUAGE } from "../config/i18n.js";

dotenv.config();

const run = async () => {
    try {
        await connectDB();

        const categories = await Category.find({})
            .select("_id name description")
            .lean();

        if (categories.length === 0) {
            console.log("No categories found, skip seeding category translations.");
            return;
        }

        const operations = categories.map((category) => ({
            updateOne: {
                filter: {
                    category_id: category._id,
                    language: DEFAULT_LANGUAGE
                },
                update: {
                    $set: {
                        name: category.name,
                        description: category.description ?? null
                    }
                },
                upsert: true
            }
        }));

        const result = await CategoryTranslation.bulkWrite(operations);
        console.log("Seed category translations completed", {
            language: DEFAULT_LANGUAGE,
            matched: result.matchedCount,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });
    } catch (error) {
        console.error("Seed category translations failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
