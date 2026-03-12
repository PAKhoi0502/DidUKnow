import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../modules/category/category.model.js";

dotenv.config();

const seedCategories = [
    {
        name: "Science",
        slug: "science",
        description: "Scientific discoveries and explanations.",
        icon: "science"
    },
    {
        name: "History",
        slug: "history",
        description: "Historical events, people, and civilizations.",
        icon: "history"
    },
    {
        name: "Technology",
        slug: "technology",
        description: "Technology trends, inventions, and digital life.",
        icon: "technology"
    },
    {
        name: "Nature",
        slug: "nature",
        description: "Natural phenomena, ecosystems, and environment.",
        icon: "nature"
    },
    {
        name: "Human",
        slug: "human",
        description: "Human body, behavior, and psychology facts.",
        icon: "human"
    },
    {
        name: "Space",
        slug: "space",
        description: "Astronomy, planets, and the universe.",
        icon: "space"
    },
    {
        name: "Language",
        slug: "language",
        description: "Languages, linguistics, and communication facts.",
        icon: "language"
    },
    {
        name: "Animals",
        slug: "animals",
        description: "Animal behavior, biology, and species facts.",
        icon: "animals"
    }
];

const run = async () => {
    try {
        await connectDB();

        const operations = seedCategories.map((category) => ({
            updateOne: {
                filter: { slug: category.slug },
                update: {
                    $set: {
                        name: category.name,
                        slug: category.slug,
                        description: category.description,
                        icon: category.icon
                    }
                },
                upsert: true
            }
        }));

        const result = await Category.bulkWrite(operations);
        console.log("Seed categories completed", {
            matched: result.matchedCount,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });
    } catch (error) {
        console.error("Seed categories failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
