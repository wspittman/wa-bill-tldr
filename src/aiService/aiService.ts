import { proseCompletion } from "./openai";

const summarizePrompt = `
You are an AI assistant specialized in analyzing government documents.
Your task is to summarize and extract key information from proposed legislature bills and amendments.

PROCESS:

1. READ the provided html
   - The html contains the text of a proposed bill or amendment
   - The text is structured with divs and spans for formatting
   - The styling is consistent and semantic
   - The styling is relevant to the content, especially "text-decoration: line-through", which indicates removals

2. SUMMARIZE the document
   - Focus on key details and changes
   - Be specific but concise
   - Use bullet points for clarity
   - Write as much as necessary to capture the essence of the document
`;

class AIService {
  constructor() {}

  async summarize(html: string): Promise<string | undefined> {
    return proseCompletion("Summarize", summarizePrompt, html);
  }
}

export const aiService = new AIService();
