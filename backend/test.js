const assert = require('assert');
const { processData } = require('./lib/processor');

const identity = {
  user_id: 'johndoe_17091999',
  email_id: 'john.doe@college.edu',
  college_roll_number: '21CS1001',
};

const input = [
  'A->B', 'A->C', 'B->D', 'C->E', 'E->F',
  'X->Y', 'Y->Z', 'Z->X',
  'P->Q', 'Q->R',
  'G->H', 'G->H', 'G->I',
  'hello', '1->2', 'A->',
];

const expected = {
  user_id: 'johndoe_17091999',
  email_id: 'john.doe@college.edu',
  college_roll_number: '21CS1001',
  hierarchies: [
    {
      root: 'A',
      tree: { A: { B: { D: {} }, C: { E: { F: {} } } } },
      depth: 4,
    },
    { root: 'X', tree: {}, has_cycle: true },
    { root: 'P', tree: { P: { Q: { R: {} } } }, depth: 3 },
    { root: 'G', tree: { G: { H: {}, I: {} } }, depth: 2 },
  ],
  invalid_entries: ['hello', '1->2', 'A->'],
  duplicate_edges: ['G->H'],
  summary: { total_trees: 3, total_cycles: 1, largest_tree_root: 'A' },
};

const actual = processData(input, identity);

try {
  assert.deepStrictEqual(actual, expected);
  console.log('PASS: PDF example matches expected output exactly.');
} catch (err) {
  console.error('FAIL: output does not match expected.');
  console.error('\nACTUAL:\n', JSON.stringify(actual, null, 2));
  console.error('\nEXPECTED:\n', JSON.stringify(expected, null, 2));
  process.exit(1);
}

// Edge cases
const edgeCases = [
  {
    name: 'whitespace trim',
    input: [' A->B ', 'A->B'],
    expect: (r) => r.duplicate_edges.length === 1 && r.hierarchies[0].root === 'A',
  },
  {
    name: 'self-loop invalid',
    input: ['A->A'],
    expect: (r) => r.invalid_entries[0] === 'A->A' && r.hierarchies.length === 0,
  },
  {
    name: 'diamond: first parent wins',
    input: ['A->D', 'B->D'],
    expect: (r) => r.hierarchies.length === 1 && r.hierarchies[0].root === 'A',
  },
  {
    name: 'duplicate counted once even if repeated 3 times',
    input: ['A->B', 'A->B', 'A->B'],
    expect: (r) => r.duplicate_edges.length === 1 && r.duplicate_edges[0] === 'A->B',
  },
  {
    name: 'tiebreaker: equal depth picks lex smaller',
    input: ['B->C', 'A->D'],
    expect: (r) => r.summary.largest_tree_root === 'A',
  },
  {
    name: 'empty data returns empty structures',
    input: [],
    expect: (r) =>
      r.hierarchies.length === 0 &&
      r.invalid_entries.length === 0 &&
      r.duplicate_edges.length === 0 &&
      r.summary.total_trees === 0,
  },
];

for (const tc of edgeCases) {
  const r = processData(tc.input, identity);
  if (!tc.expect(r)) {
    console.error(`FAIL: ${tc.name}`);
    console.error(JSON.stringify(r, null, 2));
    process.exit(1);
  }
  console.log(`PASS: ${tc.name}`);
}

console.log('\nAll tests passed.');
