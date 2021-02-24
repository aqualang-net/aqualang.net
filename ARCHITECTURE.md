# Architecture

This document describes the high-level architecture of **aqualang**. Both the frontend and backend are mainly written in [TypeScript](https://www.typescriptlang.org).

## The Frontend

The frotend of aqualang is located in the `client` folder. This is where visible webpages lie that the end user interacts with. It is written using [Svelte](https://svelte.dev/), a lightweight javascript framework. Scripting is done with TypeScript and styling is done with SCSS, a superset of CSS.

The frontend gets data from the backend using a [GraphQL](https://graphql.org) Web API. Requesting data from this API is handled by [urql](https://formidable.com/open-source/urql/), a lightweight GraphQL client.

### > `client/src`

Here lies the source code of the frontend, written mostly in Svelte and TypeScript. This code will be compiled and put in `client/public/build`.

### > `client/public`

This folder contains all files visible from the browser. Most importantly, it contains `index.html`, the starting point of any webpage which then loads the compiled `bundle.css` and `bundle.js` files in `client/public/build`.

## The Backend

The backend of aqualang is located in the `server` folder. The backend is written using [Express.js](https://expressjs.com), a web framework that runs on javascript. (or, in this case, on typescript.)

The frontend gets data from the backend using a [GraphQL](https://graphql.org) Web API. Requests to this API are handled by [Apollo Server](https://www.apollographql.com/docs/apollo-server/), which gets the data from the database.

**aqualang** uses a [PostgreSQL](https://www.postgresql.org) database. To query this database from typescript, we use [Prisma](https://www.prisma.io). Prisma also handles database migrations when the schema of the database changes.

### > `server/src`

Contains the code to get the Express.js app running. The starting point is `server.ts`.

### > `server/src/api`

Contains the GraphQL resolvers that query the database using Prisma. It also contains the GraphQL API schema in `schema.graphql`. The typescript types generated from this schema are put in `server/src/api/generated`.

### > `server/prisma`

This folder contains the `schema.prisma` file and the list migrations under `server/prisma/migrations`. The `schema.prisma` file defines the tables of the PostgreSQL database, and the migrations contain SQL files to create those tables.

### > `server/dist`

This folder contains the compiled javascript files made from the typescript files in `server/src`. These files are the ones run in production.
