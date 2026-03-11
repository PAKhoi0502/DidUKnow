import swaggerJsdoc from "swagger-jsdoc";

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
                name: "User",
                description: "User management APIs"
            },
            {
                name: "Login",
                description: "Authentication APIs"
            },
            {
                name: "Language",
                description: "Language preference APIs"
            },
            {
                name: "Role",
                description: "Role management APIs"
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
                        language: { type: "string", enum: ["vi", "en"], example: "en" }
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
                            enum: ["vi", "en"],
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
                        role_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        avatar_url: { type: "string", nullable: true },
                        language: { type: "string", enum: ["vi", "en"], example: "en" },
                        status: {
                            type: "string",
                            enum: ["active", "inactive", "banned"],
                            example: "active"
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