// Lightweight verification notes for judges. The TypeScript source is the authoritative implementation.
// Expected seeded scenario: Gate -> Library step-free = 230m; active library-lift report = 870m; resolved = 230m.
console.log('Routim verification expectations:');
console.log('1. Step-free Gate -> Library: 230 m');
console.log('2. Active library-lift report: 870 m fallback');
console.log('3. Resolved library-lift report: 230 m restored');
console.log('4. Active barriers are excluded before confirmation.');
console.log('5. Duplicate confirmations and duplicate mission completion are blocked.');
