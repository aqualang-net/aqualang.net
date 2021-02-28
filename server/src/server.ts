import express from "express";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import cors from "cors";

import { addResolvers } from "./api/resolvers";

// Create Express app
const PORT = process.env.PORT || 3000;
const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());

// Set index.html
app.use(express.static(path.resolve('../client/public')));

// API
addResolvers(app);

// Launch!
app.listen({ port: PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}/`)
);
