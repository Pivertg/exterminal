import express from "express";
import cors from "cors";
import { versionRouter } from "./api/version.js";
const app = express();
app.use(cors());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/version", versionRouter);
app.listen(3000, () => console.log("Serveur pret"));
