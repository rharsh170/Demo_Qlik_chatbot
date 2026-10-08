# Lupin Insights Hub: Demo Script

**Login:** `demo@lupin.com` / `Lupin@123` (or "Sign in with Lupin SSO", which is mocked).
All figures are synthetic and illustrative. They are generated from a seeded dataset, so they are identical on every load.

## Suggested flow (about 10 minutes)

1. **Login page.** Lupin branding, SSO option.
2. **Executive Overview.** Gross Sales, Net Sales, Volume, ASP, COGS, Margin and Margin %, each with a vs-last-year delta. Then show Actual/LE vs Budget, and the Top Therapy / Product Group / Brand tiles.
3. **Filters.** Use the calendar presets (MTD/QTD/YTD/Last FY) or pick months. Select an SBU, such as US Generics, and watch every tile and chart update. The selection chips appear at the top; use the undo/redo/clear icons.
4. **Top N Rankings.** Switch the dimension (Brand / Therapy / Product Group / Dosage Form), N, and rank-by (Net Sales or Margin %).
5. **Period Comparison.** Two calendar pickers give Sales Variance and Margin Variance, plus a volume / price / currency bridge.
6. **What-If Simulator.** Move the four sliders and watch Adjusted Volume, Sales, COGS, Margin and Margin %.
7. **Currency View.** Net Sales, COGS and Margin in INR and USD, with the conversion rates.
8. **Chatbot.** Click the round sparkle icon (bottom right) to expand the assistant, and use the arrow icon in the header to collapse it. Ask the questions below. Use the **History** icon to show the last two chat sessions. The **Ask AI** pill on any chart card sends a relevant question to the assistant.

## Chatbot questions (ask them exactly like this)

| # | Question | You will see |
|---|---|---|
| 1 | Why is our revenue lower than last year? | **Commentary insights.** Four ranked drivers with ₹ Cr impact (US price erosion, US volumes, currency translation, India growth) plus a suggested action |
| 2 | Show me net sales share by therapy area for FY25-26 | **Pie / donut chart** |
| 3 | Compare margin by SBU for this year vs last year | **Grouped bar chart** |
| 4 | What are the top 5 brands by margin %? | **Horizontal bar chart** plus a table comparing margin rank with sales rank |
| 5 | How are we tracking against budget this year? | **Line chart**, Actual/LE vs Budget, with attainment tiles |
| 6 | What if volume increases by 5%, price by 2%, discount is 3% and COGS goes up by 1%? | **What-if table** (Base vs Adjusted, using the client's formulas). Change the numbers in the question and the answer follows |
| 7 | Which product groups are driving the sales variance between Q1 and Q2? | **Variance bar chart** (green/red) |
| 8 | Why has ASP dropped for inhalers? | **Line chart** (ASP trend) plus commentary |
| 9 | Show net sales, COGS and margin for US Generics in INR and USD | **Currency table** |
| 10 | Give me a summary of key insights for the leadership team | **Executive summary:** highlights, risks and actions |

Anything the assistant doesn't recognise returns a polite reply with example questions.

## Talking points for the client

- The Qlik dashboard is embedded as-is. The left part of the screen is where their real Qlik app (via `qlik-embed`) drops in, so no report is rebuilt.
- The assistant sits next to the reports and answers in plain English, with charts, tables and commentary.
- In production the assistant would call an LLM that has governed access to the same Qlik data model, so answers always match the dashboard.
- Single sign-on, role-based access and audit are standard in the production build.
