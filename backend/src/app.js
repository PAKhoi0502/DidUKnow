import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "DidUKnow API Docs",
        swaggerOptions: {
            docExpansion: "list",
            tagsSorter: "alpha",
            operationsSorter: "alpha"
        }
    })
);
app.use("/api", routes);

export default app;