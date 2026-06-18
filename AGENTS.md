# Prompt: Implement Postman-Style Environment Variables

Implement an **Environment Variables** system that behaves exactly like the Postman application.

## Requirements

### 1. Environment Management

* Add a new **Environments** section in the left sidebar.
* Users can:

  * Create a new environment.
  * Rename an environment.
  * Duplicate an environment.
  * Delete an environment.
* Example environments:

  * Development
  * Staging
  * Production
  * Local

### 2. Environment Editor

When an environment is opened, display a table with the following columns:

| Variable | Initial Value          | Current Value          |
| -------- | ---------------------- | ---------------------- |
| baseUrl  | https://localhost:3000 | https://localhost:3000 |
| token    | abc123                 | abc123                 |
| version  | v1                     | v1                     |

Features:

* Add Variable
* Edit Variable
* Delete Variable
* Search Variables
* Save Changes

### 3. Active Environment Selector

At the top of the application (next to the Send button), display a dropdown:

```
No Environment ▼

Development ▼

Staging ▼

Production ▼
```

The selected environment becomes the active environment for all requests.

### 4. Variable Resolution

Support variables using the following syntax:

```
{{baseUrl}}
{{token}}
{{version}}
{{username}}
```

Variables should automatically resolve in:

* Request URL
* Path Parameters
* Query Parameters
* Headers
* Authorization
* Body (JSON, Form Data, Raw, XML, Text)
* Pre-request Scripts
* Test Scripts

### Example

Environment:

| Variable | Initial Value                        | Current Value                        |
| -------- | ------------------------------------ | ------------------------------------ |
| baseUrl  | https://jsonplaceholder.typicode.com | https://jsonplaceholder.typicode.com |
| token    | abc123xyz                            | abc123xyz                            |

Request URL:

```
GET {{baseUrl}}/users
```

Header:

```
Authorization: Bearer {{token}}
```

Resolved Request:

```
GET https://jsonplaceholder.typicode.com/users
Authorization: Bearer abc123xyz
```

### 5. Variable Highlighting

Inside every editor:

* Detect `{{variable}}` syntax.
* Highlight variables with a distinct color.
* On hover, display:

  * Variable Name
  * Current Value
  * Environment Name

If a variable does not exist:

* Highlight it in red.
* Show "Variable not found."

### 6. Variable Resolution Priority

Resolve variables in this order:

1. Local Variables
2. Collection Variables
3. Environment Variables
4. Global Variables

The first matching variable should be used.

### 7. Collection Variables

Each collection should have its own Variables tab.

Columns:

| Variable | Value |
| -------- | ----- |

Collection variables are available only inside that collection.

### 8. Global Variables

Create a Global Variables section that is accessible across the entire workspace.

### 9. UI/UX

* Replicate the Postman environment experience as closely as possible.
* Use the same workflow:

  * Left sidebar for Environments
  * Top active environment dropdown
  * Variable table editor
  * Save button
  * Add Variable button
  * Inline editing
  * Search functionality
  * Automatic variable substitution

### 10. Runtime Behavior

Before sending a request:

1. Read the active environment.
2. Find every `{{variable}}`.
3. Resolve using the priority order.
4. Replace placeholders with actual values.
5. Send the final resolved request.

### 11. Additional Features

* Import/Export environments as JSON.
* Duplicate environments.
* Persist active environment across sessions.
* Real-time preview of resolved URL.
* Validation for duplicate variable names.
* Auto-save unsaved changes warning.
* Support unlimited environments and variables.

### Goal

The implementation should feel identical to Postman's environment management system while maintaining a clean modern UI and seamless variable resolution throughout the application.
