import express from "express";
import compression from "compression";
import helmet from "helmet";
import path from "path";

import { addResolvers } from "./api/resolvers";

// Create Express app
const PORT = process.env.PORT || 3000;
const app = express();
app.use(helmet());
app.use(compression());

// Set index.html
app.use(express.static(path.resolve('../client/public')));

// API
addResolvers(app);

// Redirect the rest to Svelte
app.get('*', function (_req, res) {
    res.sendFile(path.resolve('../client/public/index.html'));
});

// Launch!
app.listen({ port: PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}/`)
);
