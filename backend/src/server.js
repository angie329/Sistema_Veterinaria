
import express from "express";

import { config } from "./config/env.js";
import { router } from "./routes/index.js";



const app = express();

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  next();
});

app.use(express.json());
app.use("/v1", router);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Fatal error!");
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API del Sistema Veterinaria funcionando correctamente",
  });
});