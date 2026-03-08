import readline from "readline";
import { orchestrate } from "./orchestrator.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Orchestrator CLI");
console.log('Ask me anything — I\'ll route to the right specialist. Type "exit" to quit.\n');

function prompt() {
  rl.question("You: ", async (input) => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      process.exit(0);
    }

    console.log("\nAssistant:");
    try {
      const result = await orchestrate(trimmed);
      if (!result.success) {
        console.error("\nError:", result.error);
      } else if (result.cost) {
        console.log(`\n  [cost: $${result.cost.toFixed(4)}]`);
      }
    } catch (err) {
      console.error("\nError:", err.message);
    }
    console.log("\n");
    prompt();
  });
}

prompt();
