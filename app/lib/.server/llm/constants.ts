/**
 * Max output tokens per model response (see https://docs.anthropic.com/en/docs/about-claude/models).
 * A full website can exceed 8k tokens; the real ceiling is the host's function time limit
 * (roughly 115 tokens per second).
 */
export const MAX_TOKENS = 24576;

// limits the number of model responses that can be returned in a single request
export const MAX_RESPONSE_SEGMENTS = 2;
