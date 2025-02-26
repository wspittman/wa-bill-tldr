# WA Bill TL;DR

An AI-powered tool that generates summaries of [Washington State Legislature](https://app.leg.wa.gov) bills.

It includes

- The generator, a process to collect, summarize, and save data about bills.
- The web site, a plain HTML/CSS/JS interface to browse bills and their summaries.

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

```bash
echo OPENAI_API_KEY=your-key-here > .env
```

## Usage

### Running the generator

Update bill data and summaries:

```bash
npm start
```

This will do the following:

- Fetch the latest bill metadata from the Washington State Legislature [SOAP API](https://wslwebservices.leg.wa.gov/)
- For each bill that is unknown locally or whose last action date has changed
  - Fetch full bill information from the SOAP API and update local data
  - For each document (eg. bill text) that is unknown locally or has been updated
    - Fetch the document from the legislature site and save it locally
    - Generate a summary of the bill text using OpenAI gpt-4o-mini.

Output is saved as follows:

- Bill metadata is saved to `data/bills.json`
- Bill data is saved to `data/{billNumber}.json`
- Bill summaries are saved to `data/{billNumber}_Summary.json`
- Logs are saved to `logs/start.log`

### Running the web site locally

Start a local server from the docs/ folder

```bash
cd docs
# Whatever your preferred runner is
python -m http.server 8000
```

## Project Structure

- `/src` - TypeScript source code
  - `/aiService` - AI summary generation
  - `/billService` - Bill data (docs/data) management
  - `/wslWebService` - WA Legislature API client
- `/docs` - Web interface files
  - `/data` - Generated bill data and summaries

## Disclaimer

AI-generated summaries may contain errors. Always refer to official bill text for accurate information.
