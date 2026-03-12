import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Fact from "../modules/fact/fact.model.js";
import FactTranslation from "../modules/fact/factTranslation.model.js";
import { DEFAULT_LANGUAGE } from "../config/i18n.js";

dotenv.config();

const run = async () => {
    try {
        await connectDB();

        const facts = await Fact.find({})
            .select("_id title short_fact content")
            .lean();

        if (facts.length === 0) {
            console.log("No facts found, skip seeding fact translations.");
            return;
        }

        const operations = facts.map((fact) => ({
            updateOne: {
                filter: {
                    fact_id: fact._id,
                    language: DEFAULT_LANGUAGE
                },
                update: {
                    $set: {
                        title: fact.title,
                        short_fact: fact.short_fact,
                        content: fact.content
                    }
                },
                upsert: true
            }
        }));

        const result = await FactTranslation.bulkWrite(operations);
        console.log("Seed fact translations completed", {
            language: DEFAULT_LANGUAGE,
            matched: result.matchedCount,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });
    } catch (error) {
        console.error("Seed fact translations failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
