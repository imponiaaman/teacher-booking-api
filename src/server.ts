import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectDatabase } from "./config/database";
async function start() {
  await connectDatabase();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`API running on port ${port}`));
}
start().catch(err => { console.error("Startup failed", err); process.exit(1); });
