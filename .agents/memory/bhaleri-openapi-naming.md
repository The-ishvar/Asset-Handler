---
name: Bhaleri OpenAPI naming
description: Patterns to avoid Orval codegen conflicts in this project's OpenAPI spec
---

# OpenAPI Naming Rules

## Inline requestBody vs named schema
Orval generates a `<OperationId>Body` type for each operation's requestBody. If two generated files export the same name, `typecheck:libs` fails with TS2308.

**Fix:** Always use `$ref: "#/components/schemas/MyInputSchema"` for requestBody schemas instead of inline objects. This way Orval generates the type from the named schema, not a derived name.

**Example:** `PatchMyProfileBody` conflict was caused by inline requestBody on `patchMyProfile`. Fixed by creating `ProfileUpdateInput` schema and referencing it.

## Event date field
The Event schema in openapi.yaml uses `date` (not `eventDate`). Frontend must use `event.date`.

## After any schema change
Always run: `pnpm --filter @workspace/api-spec run codegen`
This runs Orval + `typecheck:libs` to catch naming conflicts before they reach the frontend.
