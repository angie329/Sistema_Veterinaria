import express from "express";

import { config } from "./config/env.js";
import { router } from "./routes/index.js";

const app = express();

app.use(express.json());
app.use("/v1", router);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Fatal error!");
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
