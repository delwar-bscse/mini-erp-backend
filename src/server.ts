import mongoose from "mongoose";
import colors from "colors";

import app from "./app";
import config from "./config";
import seedSuperAdmin from "./DB";
import { errorLogger, logger } from "./shared/logger";

let server: any;

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  errorLogger.error("Uncaught Exception:", error);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green("Database connected successfully"));

    // Seed Super Admin
    await seedSuperAdmin();

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);

    // Start Express server
    server = app.listen(port, config.ip_address as string, () => {
      logger.info(colors.yellow(`Application listening on port: ${port}`));
    });
  } catch (error) {
    errorLogger.error(colors.red("Failed to start application"), error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  errorLogger.error("Unhandled Rejection:", error);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM (used by ts-node-dev, Docker, PM2, etc.)
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      logger.info("Server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle Ctrl + C
process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      logger.info("Server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
