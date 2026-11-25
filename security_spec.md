# Security Specification & Payload TDD

## 1. Data Invariants
1. Every document under `/users/{userId}` and its subcollections (`accounts`, `transactions`, `categories`, `payees`, `schedules`) is strictly owned by `userId` (`ownerId == request.auth.uid`), with `request.auth.token.email_verified == true`.
2. Subcollection documents cannot be orphaned: `/users/{userId}` must exist (or be created atomically in the same batch via `existsAfter`), and `transactions` / `schedules` must reference an `accountId` that exists under `/users/{userId}/accounts/{accountId}`.
3. Document IDs (`userId`, `accountId`, `txId`, `catId`, `payeeId`, `scheduleId`) must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
4. All `createdAt` and `updatedAt` timestamps must equal `request.time`, and `createdAt`, `id`, `ownerId`/`uid` are immutable after creation.
5. `theme` is restricted to `'light'` or `'dark'`. `type` is restricted to `'income'` or `'expense'`. `amount` must be `> 0`. `day` in schedules must be an integer `1..28`.
6. No PII (`email`, `phone`, `address`) is stored in Firestore documents; shadow/unknown keys are rejected via `hasOnly` and `affectedKeys().hasOnly(...)`.

## 2. The "Dirty Dozen" Attack Payloads (All Must Yield PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: Read or write `/users/userA/transactions/tx1` with `request.auth == null`.
2. **Unverified Email Write**: Create `/users/userA` with `request.auth.uid == 'userA'` and `email_verified: false`.
3. **Cross-User Read/List**: User B (`uid: 'userB'`) attempts `get` or `list` on `/users/userA/transactions`.
4. **Identity Spoofing on Create**: User A creates `/users/userA/transactions/tx1` with `ownerId: 'userB'`.
5. **Shadow / Ghost Field Injection**: User A creates `/users/userA/accounts/acc1` with an extra field `isAdmin: true`.
6. **ID Poisoning**: User A attempts to create `/users/userA/transactions/bad..id/../../x` or a 300-character ID.
7. **Orphaned Transaction**: User A creates `/users/userA/transactions/tx1` referencing `accountId: 'nonexistent-acc'`.
8. **Negative or Zero Amount**: User A creates `/users/userA/transactions/tx1` with `amount: -50` or `amount: 0`.
9. **Client Timestamp Forgery**: User A creates `/users/userA/accounts/acc1` with `createdAt: new Date('2020-01-01')` instead of `serverTimestamp()`.
10. **Immutable Field Mutation**: User A updates `/users/userA/transactions/tx1` attempting to modify `createdAt`, `id`, or `ownerId`.
11. **Oversized Array / String Exhaustion**: User A creates `/users/userA` with `paymentMethods` containing 35 entries or a transaction `label` of 500 characters.
12. **Invalid Enum / Schedule Day**: User A sets `theme: 'neon'` on `/users/userA` or `day: 31` on `/users/userA/schedules/sch1`.
