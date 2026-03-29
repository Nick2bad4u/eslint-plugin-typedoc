import { RuleTester } from "@typescript-eslint/rule-tester";
import * as jsoncParser from "jsonc-eslint-parser";
import { afterAll, describe, it } from "vitest";

import { getTypedocRule } from "./_internal/ruleTester.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
    languageOptions: {
        parser: jsoncParser,
    },
});

ruleTester.run(
    "require-typedoc-config-options",
    getTypedocRule("require-typedoc-config-options"),
    {
        invalid: [
            {
                code: `{
    "entryPoints": ["./src/plugin.ts"]
}`,
                errors: [
                    {
                        messageId: "missingOption",
                        suggestions: [
                            {
                                messageId: "addOption",
                                output: `{
    "entryPoints": ["./src/plugin.ts"],
    "tsconfig": "./tsconfig.json"

}`,
                            },
                        ],
                    },
                ],
                filename: "typedoc.config.json",
            },
        ],
        valid: [
            {
                code: `{
    "entryPoints": ["./src/plugin.ts"],
    "tsconfig": "./tsconfig.json"
}`,
                filename: "typedoc.config.json",
            },
            {
                code: `{
    "entryPointStrategy": "expand"
}`,
                filename: "some-other-config.json",
            },
        ],
    }
);
