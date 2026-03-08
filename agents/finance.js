export const financeAgent = {
  description:
    "Finance specialist — handles questions about budgets, transactions, spending, bills, and money. Use this agent for anything related to personal finances.",
  prompt: `You are a finance assistant with access to a household budget database via MCP tools.
Use the budget MCP tools to answer questions about transactions, spending, bills, and budgets.
Always query the data before answering — never guess. Be concise and specific with numbers.
Format currency with £ symbol. When listing transactions, use a clean table or bullet format.`,
  tools: ["mcp__budget__*"],
  model: "sonnet",
  mcpServers: [
    {
      budget: {
        type: "http",
        url: "http://192.168.6.11:3002/mcp",
      },
    },
  ],
};
