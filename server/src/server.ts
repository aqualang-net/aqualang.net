import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import "graphql-import-node";
import * as schema from "./api/schema.graphql"
import { resolvers } from "./api/resolvers";
import { ApolloServer } from "apollo-server-express";

async function run() {
    // Create Apollo server
    const server = new ApolloServer({ typeDefs: schema, resolvers });

    // Create Express app
    const PORT = process.env.PORT || 3000;
    const app = express();
    app.use(cors());
    // app.use(helmet()); // ! Doesn't work with the graphql playground
    app.use(compression());
    server.applyMiddleware({ app, path: '/graphql' });

    // Set index.html
    app.use(express.static(path.resolve('../client/public')));
    app.get('*', function (_req, res) {
        res.sendFile(path.resolve('../client/public/index.html'));
    });

    // Launch!
    app.listen({ port: PORT }, () =>
        console.log(`🚀 Server ready at http://localhost:${PORT}/`)
    );
}

run();
