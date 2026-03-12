import swaggerJsdoc from "swagger-jsdoc";
import { SUPPORTED_LANGUAGES } from "./i18n.js";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "DidUKnow API Documentation",
            version: "1.0.0",
            description: "Simple API documentation"
        },
        tags: [
            {
                name: "Login",
                description: "Authentication APIs"
            },
            {
                name: "Role",
                description: "Role management APIs"
            },
            {
                name: "User",
                description: "User management APIs"
            },
            {
                name: "Category",
                description: "Category management APIs"
            },
            {
                name: "Fact",
                description: "Fact management APIs"
            },
            {
                name: "Media",
                description: "Media upload APIs"
            },
            {
                name: "Language",
                description: "Language preference APIs"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "Token"
                }
            },
            schemas: {
                CreateUserInput: {
                    type: "object",
                    required: ["username", "email", "password"],
                    properties: {
                        username: { type: "string", example: "johndoe" },
                        email: { type: "string", example: "john@example.com" },
                        password: { type: "string", example: "secret123" },
                        avatar_url: { type: "string", nullable: true },
                        language: { type: "string", enum: SUPPORTED_LANGUAGES, example: "en" }
                    }
                },
                CreateRoleInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", example: "user" },
                        description: { type: "string", nullable: true },
                        status: {
                            type: "string",
                            enum: ["active", "inactive"],
                            example: "active"
                        }
                    }
                },
                UpdateRoleInput: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "editor" },
                        description: { type: "string", nullable: true },
                        status: {
                            type: "string",
                            enum: ["active", "inactive"],
                            example: "active"
                        }
                    }
                },
                LoginUserInput: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", example: "john@example.com" },
                        password: { type: "string", example: "secret123" }
                    }
                },
                UpdateLanguageInput: {
                    type: "object",
                    required: ["language"],
                    properties: {
                        language: {
                            type: "string",
                            enum: SUPPORTED_LANGUAGES,
                            example: "vi"
                        }
                    }
                },
                UpdateUserInput: {
                    type: "object",
                    properties: {
                        username: { type: "string", example: "newname" },
                        email: { type: "string", example: "newmail@example.com" },
                        password: { type: "string", example: "newsecret123" },
                        avatar_url: { type: "string", nullable: true },
                        language: { type: "string", enum: SUPPORTED_LANGUAGES, example: "en" },
                        status: {
                            type: "string",
                            enum: ["active", "inactive", "banned"],
                            example: "active"
                        }
                    }
                },
                UpdateUserRoleInput: {
                    type: "object",
                    required: ["role_id"],
                    properties: {
                        role_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        reason: { type: "string", example: "Promoted to moderator for content review tasks" }
                    }
                },
                FactContentImageInput: {
                    type: "object",
                    required: ["url"],
                    properties: {
                        url: { type: "string", format: "uri", example: "https://cdn.example.com/facts/honey-1.jpg" },
                        alt: { type: "string", nullable: true, maxLength: 150, example: "Ancient honey jar" },
                        caption: { type: "string", nullable: true, maxLength: 200, example: "Honey jar found in an ancient tomb" }
                    }
                },
                FactContentInput: {
                    type: "object",
                    required: ["intro", "body", "conclusion"],
                    properties: {
                        intro: { type: "string", minLength: 20, maxLength: 400, example: "Honey is one of the most stable natural foods." },
                        body: {
                            type: "string",
                            minLength: 80,
                            maxLength: 8000,
                            example: "Its low water content and natural acidity make it difficult for microbes to grow, which is why properly stored honey can remain edible for very long periods."
                        },
                        conclusion: { type: "string", minLength: 20, maxLength: 600, example: "In proper conditions, honey can stay safe and delicious for years." },
                        images: {
                            type: "array",
                            maxItems: 10,
                            items: {
                                $ref: "#/components/schemas/FactContentImageInput"
                            }
                        }
                    }
                },
                CreateFactInput: {
                    type: "object",
                    required: ["title", "short_fact", "content", "category_id"],
                    properties: {
                        title: { type: "string", minLength: 5, maxLength: 150, example: "Did you know octopuses have three hearts?" },
                        short_fact: { type: "string", minLength: 10, maxLength: 280, example: "Octopuses have three hearts and blue blood." },
                        content: {
                            $ref: "#/components/schemas/FactContentInput"
                        },
                        category_id: { type: "string", example: "67ceca911fdb988f26fcbf95" }
                    }
                },
                UpdateFactInput: {
                    type: "object",
                    properties: {
                        title: { type: "string", minLength: 5, maxLength: 150, example: "Did you know honey never spoils?" },
                        short_fact: { type: "string", minLength: 10, maxLength: 280, example: "Archaeologists found 3000-year-old edible honey." },
                        content: {
                            $ref: "#/components/schemas/FactContentInput"
                        },
                        category_id: { type: "string", example: "67ceca911fdb988f26fcbf95" }
                    }
                },
                UpdateFactStatusInput: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: {
                            type: "string",
                            enum: ["draft", "published"],
                            example: "published"
                        },
                        reason: {
                            type: "string",
                            minLength: 3,
                            example: "Reviewed and approved for public display"
                        }
                    }
                },
                UpsertFactTranslationInput: {
                    type: "object",
                    required: ["title", "short_fact", "content"],
                    properties: {
                        title: { type: "string", minLength: 5, maxLength: 150, example: "Ban co biet mat ong khong bao gio hong?" },
                        short_fact: { type: "string", minLength: 10, maxLength: 280, example: "Mat ong co the giu duoc hang nghin nam neu bao quan tot." },
                        content: {
                            $ref: "#/components/schemas/FactContentInput"
                        }
                    }
                },
                FactResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        title: { type: "string", example: "Did you know octopuses have three hearts?" },
                        short_fact: { type: "string", example: "Octopuses have three hearts and blue blood." },
                        content: { $ref: "#/components/schemas/FactContentInput" },
                        category_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        status: { type: "string", enum: ["draft", "published"], example: "published" },
                        created_by: { type: "string", example: "67ceca911fdb988f26fcbf97" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                FactListPagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        total: { type: "integer", example: 24 },
                        total_pages: { type: "integer", example: 3 }
                    }
                },
                FactListDataResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/FactResponse"
                            }
                        },
                        pagination: {
                            $ref: "#/components/schemas/FactListPagination"
                        }
                    }
                },
                FactItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get fact successfully" },
                        data: {
                            $ref: "#/components/schemas/FactResponse"
                        }
                    }
                },
                FactListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get facts successfully" },
                        data: {
                            $ref: "#/components/schemas/FactListDataResponse"
                        }
                    }
                },
                FactTranslationResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        language: { type: "string", enum: SUPPORTED_LANGUAGES, example: "vi" },
                        title: { type: "string", example: "Ban co biet mat ong khong bao gio hong?" },
                        short_fact: { type: "string", example: "Mat ong co the giu duoc hang nghin nam neu bao quan tot." },
                        content: { $ref: "#/components/schemas/FactContentInput" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                FactTranslationItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Upsert fact translation successfully" },
                        data: {
                            $ref: "#/components/schemas/FactTranslationResponse"
                        }
                    }
                },
                CreateCategoryInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 60, example: "Science" },
                        slug: { type: "string", example: "science" },
                        description: { type: "string", nullable: true, example: "Scientific discoveries and explanations." },
                        icon: { type: "string", nullable: true, example: "science-icon" }
                    }
                },
                UpdateCategoryInput: {
                    type: "object",
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 60, example: "Space Science" },
                        slug: { type: "string", example: "space-science" },
                        description: { type: "string", nullable: true, example: "Facts related to space and astronomy." },
                        icon: { type: "string", nullable: true, example: "space-icon" }
                    }
                },
                UpsertCategoryTranslationInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 60, example: "Khoa hoc" },
                        description: { type: "string", nullable: true, example: "Kien thuc va giai thich khoa hoc." }
                    }
                },
                CategoryResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        name: { type: "string", example: "Science" },
                        slug: { type: "string", example: "science" },
                        description: { type: "string", nullable: true, example: "Scientific discoveries and explanations." },
                        icon: { type: "string", nullable: true, example: "science-icon" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                CategoryTranslationResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        category_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        language: { type: "string", enum: SUPPORTED_LANGUAGES, example: "vi" },
                        name: { type: "string", example: "Khoa hoc" },
                        description: { type: "string", nullable: true, example: "Kien thuc va giai thich khoa hoc." },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                CategoryTranslationItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Upsert category translation successfully" },
                        data: {
                            $ref: "#/components/schemas/CategoryTranslationResponse"
                        }
                    }
                },
                MediaUploadResponse: {
                    type: "object",
                    properties: {
                        url: { type: "string", format: "uri", example: "https://res.cloudinary.com/demo/image/upload/v12345/diduknow/facts/example.jpg" },
                        public_id: { type: "string", example: "diduknow/facts/example" },
                        width: { type: "integer", nullable: true, example: 1200 },
                        height: { type: "integer", nullable: true, example: 800 },
                        format: { type: "string", nullable: true, example: "jpg" },
                        bytes: { type: "integer", nullable: true, example: 194238 },
                        resource_type: { type: "string", example: "image" }
                    }
                },
                MediaUploadApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Upload image successfully" },
                        data: {
                            $ref: "#/components/schemas/MediaUploadResponse"
                        }
                    }
                }
            },
            requestBodies: {
                CreateUserRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateUserInput"
                            }
                        }
                    }
                },
                CreateRoleRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateRoleInput"
                            }
                        }
                    }
                },
                UpdateRoleRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateRoleInput"
                            }
                        }
                    }
                },
                LoginUserRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LoginUserInput"
                            }
                        }
                    }
                },
                UpdateLanguageRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateLanguageInput"
                            }
                        }
                    }
                },
                UpdateUserRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateUserInput"
                            }
                        }
                    }
                },
                UpdateUserRoleRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateUserRoleInput"
                            }
                        }
                    }
                },
                CreateFactRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateFactInput"
                            }
                        }
                    }
                },
                UpdateFactRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateFactInput"
                            }
                        }
                    }
                },
                UpdateFactStatusRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateFactStatusInput"
                            }
                        }
                    }
                },
                UpsertFactTranslationRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpsertFactTranslationInput"
                            }
                        }
                    }
                },
                CreateCategoryRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateCategoryInput"
                            }
                        }
                    }
                },
                UpdateCategoryRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateCategoryInput"
                            }
                        }
                    }
                },
                UpsertCategoryTranslationRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpsertCategoryTranslationInput"
                            }
                        }
                    }
                }
            },
            responses: {
                CreatedResponse: {
                    description: "created"
                },
                ValidationFailedResponse: {
                    description: "validation failed"
                },
                UserDuplicateResponse: {
                    description: "duplicate email or username"
                },
                RoleDuplicateResponse: {
                    description: "duplicate role name"
                },
                CategoryDuplicateResponse: {
                    description: "duplicate category name or slug"
                },
                CategoryInUseResponse: {
                    description: "cannot delete category because it is being used by facts"
                },
                RoleInUseResponse: {
                    description: "cannot delete role because it is being used by users"
                },
                ForbiddenResponse: {
                    description: "forbidden"
                },
                NotFoundResponse: {
                    description: "resource not found"
                }
            }
        }
    },
    apis: ["./src/routes/*.js", "./src/modules/**/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;