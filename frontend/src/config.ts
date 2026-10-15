/**
 * The Python backend (FastAPI) lives here. The UI only calls it.
 * GET /state and POST /reset need CORS for the Vite origin (http://localhost:5173).
 * GET /video is an image, so it does not.
 *
 * Mock mode is on unless VITE_USE_MOCK=false. The header toggle overrides it for the session.
 */
export const API_URL = "http://localhost:8000";

export const MOCK_BY_DEFAULT = import.meta.env.VITE_USE_MOCK !== "false";

export const POLL_MS = 500;
export const MOCK_STEP_MS = 2000;
