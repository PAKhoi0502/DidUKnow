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
                name: "Tag",
                description: "Tag management APIs"
            },
            {
                name: "Favourite",
                description: "Favourite facts APIs"
            },
            {
                name: "FactView",
                description: "Fact views analytics APIs"
            },
            {
                name: "ReportFact",
                description: "Report incorrect fact APIs"
            },
            {
                name: "Comment",
                description: "Comment APIs"
            },
            {
                name: "BookmarkCollection",
                description: "Bookmark collections APIs"
            },
            {
                name: "CollectionFact",
                description: "Collection facts APIs"
            },
            {
                name: "AdminLog",
                description: "Admin audit logs APIs"
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
                FactContentImageTranslationInput: {
                    type: "object",
                    properties: {
                        url: { type: "string", format: "uri", nullable: true, example: "https://cdn.example.com/facts/honey-1.jpg" },
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
                FactContentTranslationInput: {
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
                                $ref: "#/components/schemas/FactContentImageTranslationInput"
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
                        category_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        tag_ids: {
                            type: "array",
                            items: { type: "string" },
                            example: ["67ceca911fdb988f26fcbf99", "67ceca911fdb988f26fcbf9a"]
                        }
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
                        category_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        tag_ids: {
                            type: "array",
                            items: { type: "string" },
                            example: ["67ceca911fdb988f26fcbf99", "67ceca911fdb988f26fcbf9a"]
                        }
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
                            $ref: "#/components/schemas/FactContentTranslationInput"
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
                        tag_ids: {
                            type: "array",
                            items: { type: "string" },
                            example: ["67ceca911fdb988f26fcbf99", "67ceca911fdb988f26fcbf9a"]
                        },
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
                RandomFactMeta: {
                    type: "object",
                    properties: {
                        cycle_reset: { type: "boolean", example: false },
                        remaining_in_cycle: { type: "integer", nullable: true, example: 12 }
                    }
                },
                RandomFactApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get random fact successfully" },
                        data: {
                            $ref: "#/components/schemas/FactResponse"
                        },
                        meta: {
                            $ref: "#/components/schemas/RandomFactMeta"
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
                        content: { $ref: "#/components/schemas/FactContentTranslationInput" },
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
                CreateTagInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 60, example: "Science" },
                        slug: { type: "string", example: "science" }
                    }
                },
                UpdateTagInput: {
                    type: "object",
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 60, example: "Astronomy" },
                        slug: { type: "string", example: "astronomy" }
                    }
                },
                TagResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        name: { type: "string", example: "Science" },
                        slug: { type: "string", example: "science" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                TagItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get tag successfully" },
                        data: {
                            $ref: "#/components/schemas/TagResponse"
                        }
                    }
                },
                TagListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get tags successfully" },
                        data: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/TagResponse"
                            }
                        }
                    }
                },
                CreateFavouriteInput: {
                    type: "object",
                    required: ["fact_id"],
                    properties: {
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf95" }
                    }
                },
                FavouriteResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        user_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf97" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                FavouriteCheckResponse: {
                    type: "object",
                    properties: {
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        is_favourited: { type: "boolean", example: true }
                    }
                },
                FavouriteListPagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        total: { type: "integer", example: 24 },
                        total_pages: { type: "integer", example: 3 }
                    }
                },
                FavouriteListDataResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/FavouriteResponse"
                            }
                        },
                        pagination: {
                            $ref: "#/components/schemas/FavouriteListPagination"
                        }
                    }
                },
                FavouriteItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Add favourite successfully" },
                        data: {
                            $ref: "#/components/schemas/FavouriteResponse"
                        }
                    }
                },
                FavouriteListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get favourites successfully" },
                        data: {
                            $ref: "#/components/schemas/FavouriteListDataResponse"
                        }
                    }
                },
                FavouriteCheckApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Check favourite successfully" },
                        data: {
                            $ref: "#/components/schemas/FavouriteCheckResponse"
                        }
                    }
                },
                FactViewByDate: {
                    type: "object",
                    properties: {
                        date: { type: "string", example: "2026-03-13" },
                        views: { type: "integer", example: 128 }
                    }
                },
                FactViewSummaryResponse: {
                    type: "object",
                    properties: {
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        total_views: { type: "integer", example: 500 },
                        unique_users: { type: "integer", example: 120 },
                        unique_guests: { type: "integer", example: 80 },
                        unique_viewers: { type: "integer", example: 200 },
                        by_date: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/FactViewByDate"
                            }
                        }
                    }
                },
                FactViewSummaryApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get fact view summary successfully" },
                        data: {
                            $ref: "#/components/schemas/FactViewSummaryResponse"
                        }
                    }
                },
                CreateReportFactInput: {
                    type: "object",
                    required: ["fact_id", "reason"],
                    properties: {
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        reason: { type: "string", minLength: 10, maxLength: 1000, example: "This fact has incorrect year information." }
                    }
                },
                UpdateReportFactStatusInput: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: {
                            type: "string",
                            enum: ["pending", "reviewing", "resolved", "rejected"],
                            example: "resolved"
                        },
                        resolution_note: {
                            type: "string",
                            nullable: true,
                            maxLength: 1000,
                            example: "Verified and corrected the fact content."
                        }
                    }
                },
                ReportFactResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        user_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf97" },
                        reason: { type: "string", example: "Incorrect source for this statement." },
                        status: { type: "string", enum: ["pending", "reviewing", "resolved", "rejected"], example: "pending" },
                        resolved_by: { type: "string", nullable: true, example: "67ceca911fdb988f26fcbf98" },
                        resolution_note: { type: "string", nullable: true, example: "Reviewed and fixed." },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                ReportFactListPagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        total: { type: "integer", example: 24 },
                        total_pages: { type: "integer", example: 3 }
                    }
                },
                ReportFactListDataResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/ReportFactResponse"
                            }
                        },
                        pagination: {
                            $ref: "#/components/schemas/ReportFactListPagination"
                        }
                    }
                },
                ReportFactItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Create report fact successfully" },
                        data: {
                            $ref: "#/components/schemas/ReportFactResponse"
                        }
                    }
                },
                ReportFactListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get report facts successfully" },
                        data: {
                            $ref: "#/components/schemas/ReportFactListDataResponse"
                        }
                    }
                },
                CreateCommentInput: {
                    type: "object",
                    required: ["fact_id", "content"],
                    properties: {
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        content: { type: "string", minLength: 2, maxLength: 1000, example: "Great fact, thanks for sharing!" }
                    }
                },
                UpdateCommentInput: {
                    type: "object",
                    required: ["content"],
                    properties: {
                        content: { type: "string", minLength: 2, maxLength: 1000, example: "Updated comment content." }
                    }
                },
                CommentResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        user_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf97" },
                        content: { type: "string", example: "Great fact!" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" }
                    }
                },
                CommentListPagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        total: { type: "integer", example: 24 },
                        total_pages: { type: "integer", example: 3 }
                    }
                },
                CommentListDataResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CommentResponse"
                            }
                        },
                        pagination: {
                            $ref: "#/components/schemas/CommentListPagination"
                        }
                    }
                },
                CommentItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Create comment successfully" },
                        data: {
                            $ref: "#/components/schemas/CommentResponse"
                        }
                    }
                },
                CommentListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get comments successfully" },
                        data: {
                            $ref: "#/components/schemas/CommentListDataResponse"
                        }
                    }
                },
                CreateBookmarkCollectionInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 80, example: "Science Picks" }
                    }
                },
                UpdateBookmarkCollectionInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 2, maxLength: 80, example: "My Updated Collection" }
                    }
                },
                BookmarkCollectionResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        user_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        name: { type: "string", example: "Science Picks" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:30:00.000Z" },
                        updated_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                BookmarkCollectionListPagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        total: { type: "integer", example: 24 },
                        total_pages: { type: "integer", example: 3 }
                    }
                },
                BookmarkCollectionListDataResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/BookmarkCollectionResponse"
                            }
                        },
                        pagination: {
                            $ref: "#/components/schemas/BookmarkCollectionListPagination"
                        }
                    }
                },
                BookmarkCollectionItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Create bookmark collection successfully" },
                        data: {
                            $ref: "#/components/schemas/BookmarkCollectionResponse"
                        }
                    }
                },
                BookmarkCollectionListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get bookmark collections successfully" },
                        data: {
                            $ref: "#/components/schemas/BookmarkCollectionListDataResponse"
                        }
                    }
                },
                CreateCollectionFactInput: {
                    type: "object",
                    required: ["collection_id", "fact_id"],
                    properties: {
                        collection_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf96" }
                    }
                },
                CollectionFactResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf97" },
                        collection_id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        fact_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:40:00.000Z" }
                    }
                },
                CollectionFactListPagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        total: { type: "integer", example: 24 },
                        total_pages: { type: "integer", example: 3 }
                    }
                },
                CollectionFactListDataResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/CollectionFactResponse"
                            }
                        },
                        pagination: {
                            $ref: "#/components/schemas/CollectionFactListPagination"
                        }
                    }
                },
                CollectionFactItemApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Add fact to collection successfully" },
                        data: {
                            $ref: "#/components/schemas/CollectionFactResponse"
                        }
                    }
                },
                CollectionFactListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get collection facts successfully" },
                        data: {
                            $ref: "#/components/schemas/CollectionFactListDataResponse"
                        }
                    }
                },
                AdminLogResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "67ceca911fdb988f26fcbf95" },
                        admin_id: { type: "string", example: "67ceca911fdb988f26fcbf96" },
                        action: { type: "string", enum: ["create", "update", "delete", "status_update"], example: "update" },
                        target_type: { type: "string", enum: ["fact", "tag", "category", "report_fact", "user", "role", "comment", "bookmark_collection"], example: "fact" },
                        target_id: { type: "string", example: "67ceca911fdb988f26fcbf97" },
                        meta: {
                            type: "object",
                            nullable: true,
                            additionalProperties: true,
                            example: {
                                new_status: "published",
                                reason: "Reviewed and approved"
                            }
                        },
                        created_at: { type: "string", format: "date-time", example: "2026-03-12T08:35:00.000Z" }
                    }
                },
                AdminLogListPagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 20 },
                        total: { type: "integer", example: 120 },
                        total_pages: { type: "integer", example: 6 }
                    }
                },
                AdminLogListDataResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/AdminLogResponse"
                            }
                        },
                        pagination: {
                            $ref: "#/components/schemas/AdminLogListPagination"
                        }
                    }
                },
                AdminLogListApiResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Get admin logs successfully" },
                        data: {
                            $ref: "#/components/schemas/AdminLogListDataResponse"
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
                CreateTagRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateTagInput"
                            }
                        }
                    }
                },
                UpdateTagRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateTagInput"
                            }
                        }
                    }
                },
                CreateFavouriteRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateFavouriteInput"
                            }
                        }
                    }
                },
                CreateReportFactRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateReportFactInput"
                            }
                        }
                    }
                },
                UpdateReportFactStatusRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateReportFactStatusInput"
                            }
                        }
                    }
                },
                CreateCommentRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateCommentInput"
                            }
                        }
                    }
                },
                UpdateCommentRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateCommentInput"
                            }
                        }
                    }
                },
                CreateBookmarkCollectionRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateBookmarkCollectionInput"
                            }
                        }
                    }
                },
                UpdateBookmarkCollectionRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateBookmarkCollectionInput"
                            }
                        }
                    }
                },
                CreateCollectionFactRequestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateCollectionFactInput"
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
                TagDuplicateResponse: {
                    description: "duplicate tag name or slug"
                },
                TagInUseResponse: {
                    description: "cannot delete tag because it is being used by facts"
                },
                FavouriteDuplicateResponse: {
                    description: "favourite already exists for this fact and user"
                },
                ReportFactDuplicateResponse: {
                    description: "user already has an open report for this fact"
                },
                BookmarkCollectionDuplicateResponse: {
                    description: "bookmark collection name already exists for this user"
                },
                CollectionFactDuplicateResponse: {
                    description: "fact already exists in this collection"
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