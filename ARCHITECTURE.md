# Architecture

This document describes the high-level architecture of **aqualang**. Both the frontend and backend are mainly written in [TypeScript](https://www.typescriptlang.org).

## The API

For the frontend to get and post data to the backend, **aqualang** uses a RESTful API.

#### > `api`

The `openapi.yaml` file describes the API using the OpenAPI Specification. The `errors.yaml` file lists the possible error messages the API can respond with.

## The Frontend

The frotend of aqualang is located in the `client` folder. This is where visible webpages lie that the end user interacts with. It is written using [Svelte](https://svelte.dev/), a lightweight javascript framework. Scripting is done with TypeScript and styling is done with SCSS, a superset of CSS.

### > `client/src`

Here lies the source code of the frontend, written mostly in Svelte and TypeScript. This code will be compiled and put in `client/public/build`. The starting point is `main.ts`.

### > `client/src/text`

Contains the code for rendering conlang text, including writing direction and hint popups.

### > `client/public`

This folder contains all files visible from the browser. Most importantly, it contains `index.html`, the starting point of any webpage which then loads the compiled `bundle.css` and `bundle.js` files in `client/public/build`.

## The Backend

The backend of aqualang is located in the `server` folder. The backend is written using [Express.js](https://expressjs.com), a web framework that runs on javascript. (or, in this case, on typescript.)

**aqualang** uses a [PostgreSQL](https://www.postgresql.org) database. To query this database from typescript, we use [Prisma](https://www.prisma.io). Prisma also handles database migrations when the schema of the database changes.

### > `server/src`

Contains the code to get the Express.js app running. The starting point is `server.ts`.

### > `server/src/api`

Contains the API request resolvers that query the database using Prisma.

### > `server/prisma`

This folder contains the `schema.prisma` file and the list migrations under `server/prisma/migrations`. The `schema.prisma` file defines the tables of the PostgreSQL database, and the migrations contain SQL files to create those tables.

### > `server/dist`

This folder contains the compiled javascript files made from the typescript files in `server/src`. These files are the ones run in production.
