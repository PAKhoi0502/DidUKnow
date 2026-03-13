import test from "node:test";
import { runInvalidFieldsCase } from "../tests/validatorTestUtils.js";
import { invalidFieldsCases } from "../tests/validatorCases.js";

for (const testCase of invalidFieldsCases) {
    test(`returns standardized invalid_fields response for ${testCase.name}`, async () => {
        await runInvalidFieldsCase(testCase.validator, { foo: "bar" }, ["foo"]);
    });
}
