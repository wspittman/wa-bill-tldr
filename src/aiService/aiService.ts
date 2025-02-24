import { logAggregation, proseCompletion } from "./openai";

const summarizePrompt = `
You are an AI assistant specialized in analyzing government documents.
Your task is to summarize and extract key information from proposed legislature bills and amendments.
Your audience is the general public, so keep the language to a high school reading level.

PROCESS:

1. READ the provided html
  - The html contains the text of a proposed bill or amendment
  - The text is structured with divs and spans for formatting
  - The styling is consistent and semantic
  - The styling is relevant to the content, especially "text-decoration: line-through", which indicates removals

2. SUMMARIZE the purpose
  - Start a section with the heading "### Purpose"
  - Identify the main goal of the bill or amendment
  - Highlight the key changes from the previous version
  - Focus on the impact of the changes
  - Use legal terminology when necessary, but keep it simple and clear

3. SUMMARIZE the key provisions
  - Start a section with the heading "### Key Provisions"
  - Group the provisions into categories if applicable
  - Format the section using "-" bullet points, with 4-space indentation.
  - Be specific but concise
  - Write as much as necessary to capture the essence of the document

Do NOT provide an overall header such as "Summary of House Bill 1234".
Do NOT list any basic information like the title, session, or sponsors. Focus on the content.
Do NOT provide a conclusion or opinion. Stick to the facts.

The output should be a summary of the document in markdown format.
`;

class AIService {
  constructor() {}

  async summarize(html: string): Promise<string | undefined> {
    return proseCompletion("Summarize", summarizePrompt, html);
  }

  logAggregation() {
    logAggregation();
  }
}

export const aiService = new AIService();
