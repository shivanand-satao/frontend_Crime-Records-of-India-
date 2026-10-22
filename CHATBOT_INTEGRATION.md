# Research assistant beta integration

## Implemented beta (supersedes the original handoff below)

The widget now calls the authenticated backend gateway with the existing Axios client
and token refresh flow. Browser -> backend -> Render chatbot -> restricted PostgreSQL.
Legal mode returns keyword source candidates, titles, editions and PDF pages, not legal
answers. Data mode requires an approved dataset: Groq proposes a structured plan; the server
validates/compiles parameterized SQL and returns read-only results with the plan for review.
Questions and selected public schema are sent to Groq; database rows are not sent to Groq.
All source/model text is rendered as text, not HTML. Account changes, logout and panel close
abort requests and clear drafts/results. History remains disabled and nothing is saved by
the assistant. Never include personal case details. Free servers can cold-start; retry.

Units, coverage and total/component overlap are unverified. Query validation is not proof
of statistical meaning. No verified current-law answers, forecasts or cross-dataset joins.
No service secret, Groq key or database credential belongs in frontend environment values.
Validate with Jest, changed-file ESLint, production build and authenticated hosted checks.

The original planning handoff below is retained as historical design context only.

## Current frontend

- The global widget is mounted inside the existing authentication provider and router in `src/routes/AppRoutes.jsx`.
- `src/components/common/ResearchAssistant.jsx` provides data and legal-document preview modes. It makes no network calls and produces no AI answers.
- `src/components/common/AssistantOverview.jsx` introduces both planned capabilities on the homepage.
- `src/context/assistantContextValue.js` lets homepage actions open the shared widget.
- Questions exist only in React memory. Closing the panel or changing the signed-in account clears them. No server-side chat session is currently created.
- No additional packages are required.

## Information needed from the deployed FastAPI service

1. Public API base URL and the exact production frontend origins allowed by CORS.
2. Authentication contract: how FastAPI validates the existing application identity. Never trust a browser-supplied user ID as authorization.
3. Session creation, message submission, history, and deletion endpoints, including request/response schemas and errors.
4. The mode identifiers for database-backed questions and document retrieval, plus whether responses stream or return complete JSON.
5. The response format for data coverage, returned records, source document titles, page references, and unsupported questions.

## Required integration behavior

- Create or restore real chat sessions only after authenticated identity is verified by the server; enforce session ownership on every endpoint.
- Clear client conversation state on logout or account switching, cancel in-flight requests, and prevent stale responses appearing for another account.
- Display loading, timeout, offline, unauthorized, rate-limit, unavailable, and empty-result states. Never fall back to invented answers.
- Keep database credentials, LLM keys, and any private service token on the server. Public frontend environment variables are not secret storage.
- The backend must enforce read-only database access, authorization, query validation, result limits, and timeouts for generated queries.
- Render model content as text unless a reviewed safe rendering strategy is added. Verify source metadata before linking to documents.
- Legal responses should retain the legal-advice limitation and show source/page references when supplied. Do not describe incomplete document indexing as complete coverage.
- Confirm actual PDF titles, document versions, retrieval coverage, and available database datasets before making live coverage claims.
- Remove preview labels and enable live session messaging only after end-to-end verification against the deployed service.

## Validation

Run the existing Jest suite with a test-only API URL, then the production build and changed-file ESLint. Preview-mode tests will need to be extended with API mocks and session ownership/account-switch scenarios when live integration is implemented.