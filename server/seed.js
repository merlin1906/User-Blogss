
import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "./models/Category.js";

dotenv.config();

const categories = [
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Latest AI technologies and innovations",
  },
  {
    name: "Web Development",
    slug: "web-development",
    description: "Modern web development technologies",
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "Cloud platforms and services",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Digital security and protection",
  },
  {
    name: "Blockchain",
    slug: "blockchain",
    description: "Blockchain technology and applications",
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const category of categories) {
      await Category.findOneAndUpdate(
        { slug: category.slug },
        category,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log("Categories inserted successfully!");
  } catch (error) {
    console.error("Seeding error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedCategories();
