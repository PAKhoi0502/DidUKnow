import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { resolveLanguage } from "./middlewares/language.middleware.js";
import { attachMessageText } from "./middlewares/responseI18n.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
        credentials: true
    })
);
app.use(resolveLanguage);
app.use(attachMessageText);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "DidUKnow API Docs",
        swaggerOptions: {
            docExpansion: "list",
            operationsSorter: "alpha"
        }
    })
);
app.use("/api", routes);
app.use(errorMiddleware);

export default app;