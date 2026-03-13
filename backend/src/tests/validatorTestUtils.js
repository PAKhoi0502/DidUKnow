import assert from "node:assert/strict";

export const createMockResponse = () => {
    const response = {
        statusCode: null,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.payload = body;
            return this;
        }
    };

    return response;
};

export const assertInvalidFieldsResponse = (res, expectedInvalidFields) => {
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.payload, {
        message: "errors.validation_failed",
        errors: ["errors.invalid_fields"],
        details: {
            invalid_fields: expectedInvalidFields
        }
    });
};

export const runInvalidFieldsCase = async (validator, body, expectedInvalidFields) => {
    const req = { body };
    const res = createMockResponse();
    let nextCalled = false;

    const next = () => {
        nextCalled = true;
    };

    await validator(req, res, next);
    assert.equal(nextCalled, false);
    assertInvalidFieldsResponse(res, expectedInvalidFields);
};
