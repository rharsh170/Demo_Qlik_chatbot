# Lupin Insights Hub (demo)

A static React demo showing a Qlik Sense dashboard embedded in a web app, with an AI chatbot beside it.
This is a client look-and-feel prototype: there is no backend, no live Qlik tenant and no live LLM. All data and chatbot answers are scripted from a seeded synthetic dataset.

## Run

Requires Node 22+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/
```

Demo login: `demo@lupin.com` / `Lupin@123`

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the walkthrough and the exact chatbot questions.

## What is in it

- **Login** page (mock auth, SSO button mocked) and a protected **Dashboard** page.
- **Qlik-style embedded app** with 5 sheets: Executive Overview, Top N Rankings, Period Comparison, What-If Simulator, Currency View. The filters are a calendar range, a scenario switch and 6 dimensions.
- **Chatbot:** a launcher icon expands and collapses the panel, the panel has a maximize option, and **History keeps the last 2 chat sessions** (localStorage). It replies with commentary, pie, bar and line charts, and tables.
- All KPIs follow the client's KPI sheet: [src/data/kpi.js](src/data/kpi.js).

## Code map

| Path | Purpose |
|---|---|
| `src/data/mockData.js` | Seeded synthetic facts (brands, SBUs, company codes, currencies, Actual/LE/Budget) |
| `src/data/kpi.js` | KPI formulas (Gross/Net Sales, COGS, Margin, ASP, Top N, What-If, Variance, INR/USD) |
| `src/data/chatResponses.js` | Scripted chatbot answers, computed from the same data as the dashboard |
| `src/components/qlik/` | Qlik frame, filters, selections bar, sheets |
| `src/components/chat/` | Chat launcher/panel, message renderer, 2-session history |
| `src/context/AuthContext.jsx` | Mock authentication |

## Going to production

1. **Real Qlik:** in `QlikEmbedFrame.jsx` (`mode="live"`), render `@qlik/embed-react` `<QlikEmbed ui="analytics/sheet" appId=... sheetId=.../>` inside `<QlikEmbedConfig>`, with your Qlik Cloud / Enterprise host and auth.
2. **Real chatbot:** replace `answer()` in `chatResponses.js` with a call to your backend. The backend sends the question plus the current Qlik selections to an LLM with governed access to the data model. The response blocks (`text`, `insights`, `pie`, `bar`, `line`, `table`, `callout`, `chips`) are the contract the UI already renders.
3. **Auth:** replace `AuthContext` with the client's SSO / identity provider.
