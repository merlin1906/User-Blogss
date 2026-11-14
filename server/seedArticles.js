
import dotenv from "dotenv";
import mongoose from "mongoose";
import Article from "./models/Article.js";
import Category from "./models/Category.js";

dotenv.config();

const articles = [
  {
    title: "The Future of Artificial Intelligence",
    slug: "future-of-artificial-intelligence",
    description: "Explore how AI is transforming industries and everyday life.",
    author: "USER-BLOGSS Team",
    categorySlug: "artificial-intelligence",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    featured: true,
    trending: true,
    content: [
      { type: "heading", text: "Introduction to Artificial Intelligence" },
      { type: "paragraph", text: "Artificial Intelligence is transforming the way people work, communicate and solve problems. It enables machines to perform tasks that normally require human intelligence." },
      { type: "heading", text: "Applications of AI" },
      { type: "paragraph", text: "AI is widely used in healthcare, education, finance, transportation and customer service. Machine learning and natural language processing are important technologies behind these applications." },
      { type: "heading", text: "The Future of AI" },
      { type: "paragraph", text: "As AI technology continues to develop, responsible innovation, data privacy and human oversight will remain important." }
    ]
  },
  {
    title: "Modern Web Development Trends",
    slug: "modern-web-development-trends",
    description: "Discover the latest tools and technologies shaping web development.",
    author: "USER-BLOGSS Team",
    categorySlug: "web-development",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    featured: false,
    trending: true,
    content: [
      { type: "heading", text: "Introduction" },
      { type: "paragraph", text: "Web development continues to evolve with new frameworks, tools and development practices." },
      { type: "heading", text: "Popular Technologies" },
      { type: "paragraph", text: "React, modern JavaScript, Node.js and cloud-based deployment tools help developers build responsive and scalable applications." },
      { type: "heading", text: "Conclusion" },
      { type: "paragraph", text: "Learning modern web technologies helps developers create better digital experiences." }
    ]
  },
  {
    title: "Understanding Cloud Computing",
    slug: "understanding-cloud-computing",
    description: "A beginner-friendly guide to cloud platforms and services.",
    author: "USER-BLOGSS Team",
    categorySlug: "cloud-computing",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    featured: false,
    trending: false,
    content: [
      { type: "heading", text: "What is Cloud Computing?" },
      { type: "paragraph", text: "Cloud computing provides computing resources such as servers, storage and databases over the internet." },
      { type: "heading", text: "Benefits of Cloud Computing" },
      { type: "paragraph", text: "It offers scalability, flexibility, remote access and reduced infrastructure management." },
      { type: "heading", text: "Conclusion" },
      { type: "paragraph", text: "Cloud platforms help businesses build and operate applications efficiently." }
    ]
  },
  {
    title: "Cybersecurity in the Digital Era",
    slug: "cybersecurity-in-digital-era",
    description: "Learn why digital security matters and how to protect online data.",
    author: "USER-BLOGSS Team",
    categorySlug: "cybersecurity",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    featured: false,
    trending: true,
    content: [
      { type: "heading", text: "Why Cybersecurity Matters" },
      { type: "paragraph", text: "Cybersecurity protects systems, networks and sensitive information from digital attacks." },
      { type: "heading", text: "Common Security Practices" },
      { type: "paragraph", text: "Strong passwords, multi-factor authentication, software updates and secure backups help reduce security risks." },
      { type: "heading", text: "Conclusion" },
      { type: "paragraph", text: "Cybersecurity is an essential part of using technology safely." }
    ]
  },
  {
    title: "Blockchain Technology Explained",
    slug: "blockchain-technology-explained",
    description: "Understand blockchain, distributed ledgers and their real-world uses.",
    author: "USER-BLOGSS Team",
    categorySlug: "blockchain",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
    featured: false,
    trending: false,
    content: [
      { type: "heading", text: "What is Blockchain?" },
      { type: "paragraph", text: "Blockchain is a distributed digital ledger that stores records in connected blocks." },
      { type: "heading", text: "How Blockchain Works" },
      { type: "paragraph", text: "Transactions are grouped into blocks and linked using cryptographic techniques. Distributed networks help maintain shared records." },
      { type: "heading", text: "Applications" },
      { type: "paragraph", text: "Blockchain can be used in supply chains, digital identity, financial services and record management." }
    ]
  }
];

const seedArticles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for article seeding");

    for (const article of articles) {
      const category = await Category.findOne({
        slug: article.categorySlug,
        isActive: true
      });

      if (!category) {
        console.log(`Category not found: ${article.categorySlug}`);
        continue;
      }

      const { categorySlug, ...articleData } = article;

      await Article.findOneAndUpdate(
        { slug: article.slug },
        {
          ...articleData,
          category: category._id,
          status: "PUBLISHED",
          publishedAt: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`Saved: ${article.title}`);
    }

    console.log("All sample articles processed successfully!");
  } catch (error) {
    console.error("Article seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedArticles();
