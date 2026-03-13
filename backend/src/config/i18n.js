import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SUPPORTED_LANGUAGES = ["vi", "en"];
export const DEFAULT_LANGUAGE = "en";

const RAW_MESSAGE_TO_KEY = new Map([
    ["Validation failed", "errors.validation_failed"],
    ["Internal server error", "errors.internal_server_error"],
    ["Request failed", "errors.request_failed"],
    ["Unauthorized", "errors.unauthorized"],
    ["Forbidden", "errors.forbidden"],
    ["User account is not active", "errors.user_not_active"],
    ["Invalid or expired token", "errors.invalid_or_expired_token"],
    ["User not found", "errors.user_not_found"],
    ["Role not found", "errors.role_not_found"],
    ["Role is not active", "errors.role_not_active"],
    ["Category not found", "errors.category_not_found"],
    ["Fact not found", "errors.fact_not_found"],
    ["Invalid email or password", "errors.invalid_credentials"],
    ["Username or email already exists", "errors.user_duplicate"],
    ["Username already exists", "errors.username_duplicate"],
    ["Email already exists", "errors.email_duplicate"],
    ["Role name already exists", "errors.role_name_duplicate"],
    ["Category name or slug already exists", "errors.category_name_or_slug_duplicate"],
    ["Category name already exists", "errors.category_name_duplicate"],
    ["Category slug already exists", "errors.category_slug_duplicate"],
    ["Cannot delete role because it is being used by users", "errors.role_in_use"],
    ["Cannot delete category because it is being used by facts", "errors.category_in_use"],
    ["Default 'User' role is not configured", "errors.default_user_role_missing"],
    ["fact_id must be a valid ObjectId", "errors.fact_id_invalid"],
    ["category_id must be a valid ObjectId", "errors.category_id_invalid"],
    ["exclude_id must be a valid ObjectId", "errors.exclude_id_invalid"],
    ["role_id does not exist", "errors.role_id_not_found"],
    ["slug is invalid", "errors.slug_invalid"],
    ["status must be one of: draft, published", "errors.fact_status_invalid"],
    ["status cannot be updated in this endpoint", "errors.fact_status_update_not_allowed"],
    ["created_by cannot be updated", "errors.fact_created_by_update_not_allowed"],
    ["At least one field is required for update", "errors.update_payload_required"],
    ["reason must be at least 3 characters", "errors.reason_min_length_3"],
    ["id must be a valid ObjectId", "errors.id_invalid"],
    ["name must be at least 2 characters", "errors.role_name_min_length_2"],
    ["name is required", "errors.name_required"],
    ["name must be between 2 and 60 characters", "errors.category_name_range_2_60"],
    ["description must be a string", "errors.description_string"],
    ["description must be a string up to 500 characters", "errors.description_string_max_500"],
    ["icon must be a string up to 255 characters", "errors.icon_string_max_255"],
    ["slug must contain lowercase letters, numbers, and hyphens only", "errors.slug_invalid_format"],
    ["title is required", "errors.fact_title_required"],
    ["title must be between 5 and 150 characters", "errors.fact_title_range_5_150"],
    ["short_fact is required", "errors.fact_short_fact_required"],
    ["short_fact must be between 10 and 280 characters", "errors.fact_short_fact_range_10_280"],
    ["content is required", "errors.fact_content_required"],
    ["content must be an object", "errors.fact_content_object_required"],
    ["content.intro must be between 20 and 400 characters", "errors.fact_content_intro_range_20_400"],
    ["content.body must be between 80 and 8000 characters", "errors.fact_content_body_range_80_8000"],
    ["content.conclusion must be between 20 and 600 characters", "errors.fact_content_conclusion_range_20_600"],
    ["content.images must be an array", "errors.fact_content_images_array"],
    ["content.images can contain at most 10 items", "errors.fact_content_images_max_10"],
    ["content.images items must be objects", "errors.fact_content_images_item_object"],
    ["content.images.url must be a valid http/https URL", "errors.fact_content_image_url_invalid"],
    ["content.images.alt must be a string up to 150 characters", "errors.fact_content_image_alt_max_150"],
    ["content.images.caption must be a string up to 200 characters", "errors.fact_content_image_caption_max_200"],
    ["category_id is required", "errors.category_id_required"],
    ["category_id does not exist", "errors.category_id_not_found"],
    ["status is required", "errors.status_required"],
    ["username must be at least 3 characters", "errors.username_min_length_3"],
    ["email is invalid", "errors.email_invalid"],
    ["password must be at least 6 characters", "errors.password_min_length_6"],
    ["password is required", "errors.password_required"],
    ["avatar_url must be a string", "errors.avatar_url_string"],
    ["language must be one of: vi, en", "errors.language_invalid_vi_en"],
    ["status must be one of: active, inactive, banned", "errors.user_status_invalid_active_inactive_banned"],
    ["role_id must be a valid ObjectId", "errors.role_id_invalid"],
    ["status must be active or inactive", "errors.role_status_invalid_active_inactive"]
]);

const mapRawMessageToKey = (message) => {
    if (typeof message !== "string") {
        return null;
    }

    if (message.includes(".")) {
        return message;
    }

    if (RAW_MESSAGE_TO_KEY.has(message)) {
        return RAW_MESSAGE_TO_KEY.get(message);
    }

    return null;
};

export const normalizeLanguage = (language) => {
    if (typeof language !== "string") {
        return null;
    }

    const normalized = language.trim().toLowerCase();
    return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : null;
};

export const parseAcceptLanguage = (acceptLanguage) => {
    if (typeof acceptLanguage !== "string" || acceptLanguage.trim().length === 0) {
        return null;
    }

    const tokens = acceptLanguage
        .split(",")
        .map((item) => item.split(";")[0]?.trim().toLowerCase())
        .filter(Boolean);

    for (const token of tokens) {
        const baseLanguage = token.split("-")[0];
        const exact = normalizeLanguage(token);
        if (exact) {
            return exact;
        }

        const base = normalizeLanguage(baseLanguage);
        if (base) {
            return base;
        }
    }

    return null;
};

export const resolveRequestLanguage = ({
    queryLang,
    acceptLanguage,
    userLanguage
} = {}) => {
    return normalizeLanguage(queryLang)
        ?? parseAcceptLanguage(acceptLanguage)
        ?? normalizeLanguage(userLanguage)
        ?? DEFAULT_LANGUAGE;
};

export const toMessageKey = (message, status = 500) => {
    const mappedKey = mapRawMessageToKey(message);
    if (mappedKey) {
        return mappedKey;
    }

    if (status >= 500) {
        return "errors.internal_server_error";
    }

    return "errors.request_failed";
};

export const toErrorKey = (message) => {
    const mappedKey = mapRawMessageToKey(message);
    if (mappedKey) {
        return mappedKey;
    }
    return typeof message === "string" ? message : "errors.request_failed";
};

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const localesDirPath = path.resolve(currentDirPath, "../locales");

const loadLocaleDictionary = (language) => {
    const filePath = path.join(localesDirPath, `messages.${language}.json`);

    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
        }
    } catch (error) {
        return {};
    }

    return {};
};

const LOCALE_DICTIONARY_BY_LANGUAGE = new Map(
    SUPPORTED_LANGUAGES.map((language) => [language, loadLocaleDictionary(language)])
);

export const t = (messageKey, language = DEFAULT_LANGUAGE) => {
    const normalizedLanguage = normalizeLanguage(language) ?? DEFAULT_LANGUAGE;
    const normalizedKey = mapRawMessageToKey(messageKey) ?? String(messageKey ?? "");

    const dictionary = LOCALE_DICTIONARY_BY_LANGUAGE.get(normalizedLanguage) || {};
    if (Object.prototype.hasOwnProperty.call(dictionary, normalizedKey)) {
        return dictionary[normalizedKey];
    }

    const fallbackDictionary = LOCALE_DICTIONARY_BY_LANGUAGE.get(DEFAULT_LANGUAGE) || {};
    if (Object.prototype.hasOwnProperty.call(fallbackDictionary, normalizedKey)) {
        return fallbackDictionary[normalizedKey];
    }

    return normalizedKey;
};
