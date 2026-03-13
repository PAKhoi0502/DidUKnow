import test from "node:test";
import assert from "node:assert/strict";
import { t, toMessageKey } from "./i18n.js";

test("maps legacy tag error to i18n key", () => {
    assert.equal(toMessageKey("Tag not found", 404), "errors.tag_not_found");
});

test("translates tag success message in English", () => {
    assert.equal(t("tags.get_success", "en"), "Get tags successfully.");
});

test("falls back to generic request failure for unknown 4xx", () => {
    assert.equal(toMessageKey("some-unknown-message", 400), "errors.request_failed");
});

test("maps dynamic invalid fields message", () => {
    assert.equal(toMessageKey("Invalid fields: foo, bar", 400), "errors.invalid_fields");
});

test("maps raw tag_ids not found message", () => {
    assert.equal(toMessageKey("One or more tag_ids do not exist", 400), "errors.tag_ids_not_found");
});
