# Project architecture
- Apply admin funding through the authorized atomic balance RPC and display its returned stored balance; stale browser calculations must not overwrite newer credits.
- Keep account metadata refreshed while signed in and discard superseded responses so navigation and focus do not display stale balances.