import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import db from './lib/db.js';
import urlRoutes from './routes/url.route.js';
import staticRoutes from './routes/static.route.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

db();

app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.status(200).json({ status: "I am Healthy" });
});

app.use("/", staticRoutes);
app.use("", urlRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
