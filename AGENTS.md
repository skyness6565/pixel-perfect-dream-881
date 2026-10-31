# Project architecture
- Apply admin funding through the authorized atomic balance RPC and display its returned stored balance; stale browser calculations must not overwrite newer credits.
- Keep account metadata refreshed while signed in and discard superseded responses so navigation and focus do not display stale balances.
- Persist withdrawal requests and immutable review history through authorized database RPCs; owner/admin read policies protect records, pending requests reserve availability without changing stored balances, and cancelled requests remain final to avoid re-reserving spent funds.
- Store only masked bank identifiers for review requests; this app does not execute bank payouts or retain complete bank numbers.