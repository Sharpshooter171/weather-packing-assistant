import "dotenv/config";

process.env.DATABASE_URL ??= "file:./dev.db";

import { createApp } from "./app.js";

const DEFAULT_PORT = 4000;
const port = Number(process.env.PORT ?? DEFAULT_PORT);

const app = createApp();

app.listen(port, () => {
  console.log(`weather-packing-assistant-api listening on port ${port}`);
});
