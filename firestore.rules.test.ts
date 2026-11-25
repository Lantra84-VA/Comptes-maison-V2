// Security Rules Verification Suite (Dirty Dozen Payloads)
// Targets rules defined in firestore.rules

export const DIRTY_DOZEN_CASES = [
  { name: 'Unauthenticated read/write', path: '/users/userA/transactions/tx1', auth: null, expected: 'PERMISSION_DENIED' },
  { name: 'Unverified email write', path: '/users/userA', auth: { uid: 'userA', token: { email_verified: false } }, expected: 'PERMISSION_DENIED' },
  { name: 'Cross-user list on transactions', path: '/users/userA/transactions', auth: { uid: 'userB', token: { email_verified: true } }, expected: 'PERMISSION_DENIED' },
  { name: 'Identity spoofing ownerId != auth.uid', path: '/users/userA/transactions/tx1', payload: { ownerId: 'userB' }, expected: 'PERMISSION_DENIED' },
  { name: 'Shadow field injection (isAdmin)', path: '/users/userA/accounts/acc1', payload: { isAdmin: true }, expected: 'PERMISSION_DENIED' },
  { name: 'Invalid ID poisoning', path: '/users/userA/transactions/invalid$id', expected: 'PERMISSION_DENIED' },
  { name: 'Orphaned transaction referencing missing account', path: '/users/userA/transactions/tx1', payload: { accountId: 'missing-acc' }, expected: 'PERMISSION_DENIED' },
  { name: 'Non-positive transaction amount', path: '/users/userA/transactions/tx1', payload: { amount: -10 }, expected: 'PERMISSION_DENIED' },
  { name: 'Forged createdAt timestamp', path: '/users/userA/accounts/acc1', payload: { createdAt: '2020-01-01T00:00:00Z' }, expected: 'PERMISSION_DENIED' },
  { name: 'Mutation of immutable createdAt/ownerId', path: '/users/userA/transactions/tx1', action: 'update', payload: { ownerId: 'userB' }, expected: 'PERMISSION_DENIED' },
  { name: 'Oversized paymentMethods array (>30)', path: '/users/userA', payload: { paymentMethods: Array(35).fill('CB') }, expected: 'PERMISSION_DENIED' },
  { name: 'Invalid theme enum / schedule day', path: '/users/userA', payload: { theme: 'neon' }, expected: 'PERMISSION_DENIED' }
];
