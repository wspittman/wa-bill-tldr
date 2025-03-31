import { proseCompletion, setAILogging } from "dry-utils/ai";
import { logger } from "dry-utils/logger";

const summarizePrompt = `
You are an AI assistant specialized in analyzing government documents.
Your task is to summarize and extract key information from proposed legislature bills.
Your audience is the general public, so keep the language to a high school reading level.

PROCESS:

1. READ the provided html
  - The html contains the text of a proposed bill
  - The text is structured with divs and spans for formatting
  - The styling is consistent and semantic
  - The styling is relevant to the content, especially "text-decoration: line-through", which indicates removals

2. SUMMARIZE the purpose
  - Start a section with the heading "### Purpose"
  - Identify the main goal of the bill
  - Highlight the key changes from the previous version
  - Focus on the impact of the changes
  - Use legal terminology when necessary, but keep it simple and clear

3. SUMMARIZE the key provisions
  - Start a section with the heading "### Key Provisions"
  - Group the provisions into categories with "####" subheadings
  - Do NOT include a category about "Definitions". Only include actionable provisions.
  - If there are multiple provisions in a category, format category content using "-" bullet points, with 4-space indentation.
  - Be specific but concise
  - Write as much as necessary to capture the essence of the document

Do NOT provide an overall header such as "Summary of House Bill 1234".
Do NOT list any basic information like the title, session, or sponsors. Focus on the content.
Do NOT provide a conclusion or opinion. Stick to the facts.

The output should be a summary of the document in markdown format.
`;

const comparePrompt = `
You are an AI assistant specialized in analyzing government documents.
Your task is to compare two versions of a proposed legislature bill.
Your audience is the general public, so keep the language to a high school reading level.

PROCESS:

1. READ the provided JSON object
  - The JSON object contains two fields:
    - "original" contains the html for the original version of the bill
    - "edited" contains the html for the edited version of the bill
  - The text is structured with divs and spans for formatting
  - The styling is consistent and semantic
  - The styling is relevant to the content, especially "text-decoration: line-through", which indicates removals

2. SUMMARIZE the purpose of the edit
  - Start a section with the heading "### Purpose"
  - Identify the main goal of the edits
  - Highlight the key content changes from the previous version
  - Focus on the impact of the changes
  - Use legal terminology when necessary, but keep it simple and clear

3. SUMMARIZE the key changes
  - Start a section with the heading "### Key Changes"
  - Focus on changes to the substantive content of the bill
  - Group the changes into categories with "####" subheadings
  - If there are multiple changes in a category, format category content using "-" bullet points, with 4-space indentation.
  - Be specific but concise
  - Write as much as necessary to capture the essence of the changes

The output should be a summary of the changes in markdown format.
`;

const keywordPrompt = `
You are an AI assistant specialized in human web search behavior.
Your task is to extract keywords from a webpage that summarizes a bill in the Washington State Legislature.

PROCESS:

1. READ the provided JSON object
  - The JSON object contains two fields:
    - "html" contains the html for bill summary page
    - "description" contains the official text description of the bill, which are already used as keywords

2. EXTRACT keywords
  - Extract the 10 keywords from the html that are most likely to be used in a search query from a user looking for the content.
  - Ignore words that are common across all bills, such as "bill", "legislation", "state", etc.
  - Ignore words that duplicate already selected keywords or are variations of already selected keywords.
  - Ignore words that are already included in the "description" field.

The output should be a list of new keywords as an all-lowercase, space-separated list.
`;

const aggregation = {
  counts: {},
  count: 0,
  tokens: 0,
  inTokens: 0,
  outTokens: 0,
  cacheTokens: 0,
  ms: 0,
};

setAILogging({
  logFn: logger.debug.bind(logger),
  errorFn: logger.error.bind(logger),
  aggregatorFn: () => aggregation,
});

class AIService {
  constructor() {}

  async summarize(html: string): Promise<string | undefined> {
    const { error, content } = await proseCompletion(
      "Summarize",
      summarizePrompt,
      html
    );

    const err = this.errorToUserFriendly(error);
    return err ?? content;
  }

  async compare(
    html: string,
    originalHtml: string
  ): Promise<string | undefined> {
    const { error, content } = await proseCompletion("Compare", comparePrompt, {
      // Remove the header information because GPT refuses to ignore it in the comparison
      original: this.removeHeader(originalHtml),
      edited: this.removeHeader(html),
    });

    const err = this.errorToUserFriendly(error);
    return err ?? content;
  }

  private removeHeader(html: string): string {
    const headerIndex = html.indexOf("AN ACT Relating to");
    return headerIndex !== -1 ? "<html><body>" + html.slice(headerIndex) : html;
  }

  async extractKeywords(
    html: string,
    description: string
  ): Promise<string | undefined> {
    const { error, content } = await proseCompletion(
      "Extract Keywords",
      keywordPrompt,
      {
        html,
        description,
      }
    );

    const err = this.errorToUserFriendly(error);
    return err ?? content?.toLowerCase();
  }

  logAggregation(): void {
    logger.info("AI Aggregation", aggregation);
  }

  private errorToUserFriendly(error?: string) {
    if (error === "OpenAI Context Too Long") {
      return "The input is too long for the AI to process.";
    } else if (error) {
      return "An error occurred while processing.";
    }
    return undefined;
  }
}

export const aiService: AIService = new AIService();
