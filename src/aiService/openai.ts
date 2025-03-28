import { setTimeout } from "node:timers/promises";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import { logger } from "../utils/logger.ts";

const client = new OpenAI();
const MODEL = "gpt-4o-mini";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

/**
 * Makes an OpenAI completion request for prose responses.
 * Includes automatic retries with exponential backoff for rate limiting.
 * @param action The name of the action for logging purposes
 * @param prompt The system prompt
 * @param input The user input string or object
 * @param history Optional array of previous chat messages
 * @returns The completion message, or undefined if the request fails
 */
export async function proseCompletion(
  action: string,
  prompt: string,
  input: string | object,
  history: ChatCompletionMessageParam[] = []
): Promise<string | undefined> {
  input = typeof input === "string" ? input : JSON.stringify(input);
  let attempt = 0;

  while (true) {
    try {
      return await proseComplete(action, prompt, input, history);
    } catch (error) {
      const errorType = getErrorType(error);
      if (errorType === "Too Long") {
        logger.error("OpenAI Context Too Long", error);
        return "The input is too long for the AI to process.";
      } else if (errorType !== "429") {
        logger.error("OpenAI Non-Backoff Error", error);
        return "An error occurred while processing.";
      } else if (attempt >= MAX_RETRIES) {
        logger.error("OpenAI Back Off Limit Exceeded", error);
        return "An error occurred while processing.";
      }

      await backoff(action, attempt);
      attempt++;
    }
  }
}

async function proseComplete(
  action: string,
  prompt: string,
  input: string,
  history: ChatCompletionMessageParam[]
) {
  const start = Date.now();
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "developer", content: prompt },
      ...history,
      { role: "user", content: input },
    ],
  });
  const duration = Date.now() - start;

  const message = completion.choices[0]?.message.content ?? undefined;

  logLLMAction(action, input, duration, completion, message);

  return message;
}

// #region Telemetry

export function logAggregation(): void {
  logger.info("OpenAI Aggregation", aggregation);
}

const aggregation = {
  counts: {} as Record<string, number>,
  count: 0,
  tokens: 0,
  inTokens: 0,
  outTokens: 0,
  cacheTokens: 0,
  ms: 0,
};

function logLLMAction(
  action: string,
  input: string,
  duration: number,
  { usage, choices }: OpenAI.ChatCompletion,
  result?: unknown
) {
  try {
    if (!usage) return;

    const { total_tokens, prompt_tokens, completion_tokens } = usage;
    const { cached_tokens = 0 } = usage.prompt_tokens_details ?? {};
    const { finish_reason, message } = choices[0] ?? {};

    const log: Record<string, unknown> = {
      in: input.length > 1000 ? input.slice(0, 997) + "..." : input,
      tokens: total_tokens,
      inTokens: prompt_tokens,
      outTokens: completion_tokens,
      cacheTokens: cached_tokens,
      ms: duration,
    };

    if (finish_reason !== "stop") {
      log["finishReason"] = finish_reason;
    }

    if (message?.refusal) {
      log["refusal"] = message.refusal;
    }

    if (result) {
      log["out"] = result;
    }

    aggregation.count++;
    aggregation.counts[action] = (aggregation.counts[action] ?? 0) + 1;
    aggregation.tokens += total_tokens;
    aggregation.inTokens += prompt_tokens;
    aggregation.outTokens += completion_tokens;
    aggregation.cacheTokens += cached_tokens;
    aggregation.ms += duration;

    logger.debug(`OpenAI ${action}`, log);
  } catch (error) {
    logger.error("OpenAI Logging Error", error);
  }
}

// #endregion

async function backoff(action: string, attempt: number) {
  logger.debug(`OpenAI ${action} backoff attempt ${attempt}`);
  return setTimeout(getBackoffDelay(attempt), true);
}

function getBackoffDelay(attempt: number) {
  const backoff = INITIAL_BACKOFF * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * backoff;
  return backoff + jitter;
}

function getErrorType(error: unknown): "429" | "Too Long" | "Other" {
  if (error instanceof OpenAI.APIError) {
    const { code, status, error: innerError } = error;
    if (
      code === "context_length_exceeded" ||
      (code === "rate_limit_exceeded" &&
        innerError.message.startsWith("Request too large"))
    ) {
      return "Too Long";
    }
    if (status === 429) return "429";
  }
  return "Other";
}
