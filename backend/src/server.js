import app from "./app.js"
import { connectDB } from "./config/db.js"
import { seedAdminAccount } from "./utils/seeder.js"
import {env} from "./config/env.js"
import { logger } from "./utils/logger.js"

try {
  await connectDB();
  await seedAdminAccount();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server listening");
  });
} catch (error) {
  logger.fatal({ err: error }, "Server startup failed");
  process.exitCode = 1;
}
