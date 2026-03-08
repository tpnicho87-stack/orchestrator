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

When a question matches a specialist's domain:
1. First, tell the user which agent you're handing over to, e.g. "Handing over to the finance agent..."
2. Then delegate using the Agent tool.
3. Return the specialist's response directly without adding commentary.

If no specialist matches, say so and list what you can help with.
Always pass the user's full question to the specialist — don't summarize or reword it.`,
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
        if (message.modelUsage) {
          console.log("\n  [model breakdown]");
          for (const [model, usage] of Object.entries(message.modelUsage)) {
            console.log(`    ${model}: $${usage.costUSD.toFixed(4)} (${usage.inputTokens + usage.outputTokens} tokens)`);
          }
        }
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
