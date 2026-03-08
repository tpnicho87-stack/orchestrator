import { query } from "@anthropic-ai/claude-agent-sdk";
import "dotenv/config";
import { financeAgent } from "./agents/finance.js";

export async function orchestrate(question) {
  let result = null;

  for await (const message of query({
    prompt: question,
    options: {
      model: "claude-haiku-4-5-20251001",
      systemPrompt: `You are a helpful home assistant that routes requests to specialist agents.

Available specialists:
- **finance**: Budgets, transactions, spending, bills, and anything money-related.

When a question matches a specialist's domain, delegate to them using the Agent tool.
If no specialist matches, say so and list what you can help with.
Always pass the user's full question to the specialist — don't summarize or reword it.
Return the specialist's response directly to the user without adding commentary.`,
      allowedTools: ["Agent"],
      agents: { finance: financeAgent },
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  })) {
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("text" in block) {
          process.stdout.write(block.text);
        }
      }
    }

    if (message.type === "result") {
      result = message;
      if (message.subtype === "success") {
        return {
          success: true,
          text: message.result,
          cost: message.total_cost_usd,
          usage: message.usage,
        };
      } else {
        return {
          success: false,
          error: message.errors?.join(", ") || "Unknown error",
        };
      }
    }
  }

  return { success: false, error: "No result received" };
}
