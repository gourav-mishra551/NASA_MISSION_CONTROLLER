// Using ES Module to use top level await (ES2022)

import "dotenv/config";

import { createServer } from "http";

import app from "./app.js";
import { mongoConnect } from "./services/mongo.js";
import { loadPlanetsData } from "./models/planets.model.js";
import { loadLaunchData } from "./models/launches.model.js";


const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;

await mongoConnect();
   
await loadPlanetsData();

await loadLaunchData();


httpServer.listen(PORT, () => {
    console.log(`app is running on port ${PORT}...`)
});