# Funding correction
- [x] Save funding atomically and display confirmed balances.
- [x] Refresh user balances and prevent stale responses.
- [x] Test exact amounts and verify the signed-in funding flow (test credit reversed).
- [x] Apply required package security update and check app health.

# Transaction review
- [x] Save withdrawal requests and expose them to authorized administrators.
- [x] Add pending/cancelled controls with required reasons and user-visible status history.
- [x] Verify submission, review, persistence and permission rules (verification request cancelled; no payout or balance change).

# Withdrawal confirmation
- [x] Add persisted Confirmed status alongside Pending and Cancelled, with review reasons.
- [x] Display accurate status for users and administrators and preserve reserved funds.
- [x] Pass 10 rule tests; verify real Pending submission, admin confirmation and account readback; cancel the verification request to release funds.