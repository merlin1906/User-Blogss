
import cron from "node-cron";
import Article from "../models/Article.js";

const startScheduledPublisher = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const result = await Article.updateMany(
        {
          status: "SCHEDULED",
          scheduledAt: { $ne: null, $lte: now },
        },
        {
          $set: {
            status: "PUBLISHED",
            publishedAt: now,
            scheduledAt: null,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `${result.modifiedCount} scheduled article(s) published successfully.`
        );
      }
    } catch (error) {
      console.error(
        "Scheduled publishing error:",
        error.message
      );
    }
  });

  console.log("Scheduled publishing service started.");
};

export default startScheduledPublisher;
