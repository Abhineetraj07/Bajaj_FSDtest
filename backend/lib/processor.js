const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

function parseEntries(data) {
  const validEdges = [];
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const seenDuplicates = new Set();

  for (const raw of data) {
    const entry = typeof raw === 'string' ? raw.trim() : '';

    if (!EDGE_PATTERN.test(entry)) {
      invalidEntries.push(entry);
      continue;
    }

    const [parent, child] = entry.split('->');
    if (parent === child) {
      invalidEntries.push(entry);
      continue;
    }

    if (seenEdges.has(entry)) {
      if (!seenDuplicates.has(entry)) {
        duplicateEdges.push(entry);
        seenDuplicates.add(entry);
      }
      continue;
    }

    seenEdges.add(entry);
    validEdges.push([parent, child]);
  }

  return { validEdges, invalidEntries, duplicateEdges };
}

function buildGraph(validEdges) {
  const parentOf = {};
  const childrenOf = {};
  const nodeFirstSeen = [];
  const seenNodes = new Set();

  const touch = (node) => {
    if (!seenNodes.has(node)) {
      seenNodes.add(node);
      nodeFirstSeen.push(node);
    }
  };

  for (const [parent, child] of validEdges) {
    if (parentOf[child] !== undefined) continue;

    touch(parent);
    touch(child);
    parentOf[child] = parent;
    if (!childrenOf[parent]) childrenOf[parent] = [];
    childrenOf[parent].push(child);
  }

  return { parentOf, childrenOf, nodeFirstSeen };
}

function findComponents(nodeFirstSeen, parentOf, childrenOf) {
  const adj = {};
  for (const node of nodeFirstSeen) adj[node] = [];
  for (const [child, parent] of Object.entries(parentOf)) {
    adj[parent].push(child);
    adj[child].push(parent);
  }

  const visited = new Set();
  const components = [];

  for (const start of nodeFirstSeen) {
    if (visited.has(start)) continue;
    const queue = [start];
    const component = [];
    visited.add(start);
    while (queue.length) {
      const node = queue.shift();
      component.push(node);
      for (const neighbor of adj[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    components.push(component);
  }

  return components;
}

function buildSubtree(root, childrenOf) {
  const children = childrenOf[root] || [];
  const subtree = {};
  for (const child of children) {
    subtree[child] = buildSubtree(child, childrenOf);
  }
  return subtree;
}

function computeDepth(root, childrenOf) {
  const children = childrenOf[root] || [];
  if (children.length === 0) return 1;
  let max = 0;
  for (const child of children) {
    const d = computeDepth(child, childrenOf);
    if (d > max) max = d;
  }
  return 1 + max;
}

function buildHierarchies(components, parentOf, childrenOf) {
  const hierarchies = [];

  for (const component of components) {
    const roots = component.filter((n) => parentOf[n] === undefined);

    if (roots.length === 0) {
      const root = [...component].sort()[0];
      hierarchies.push({ root, tree: {}, has_cycle: true });
      continue;
    }

    const root = roots[0];
    const tree = { [root]: buildSubtree(root, childrenOf) };
    const depth = computeDepth(root, childrenOf);
    hierarchies.push({ root, tree, depth });
  }

  return hierarchies;
}

function buildSummary(hierarchies) {
  const trees = hierarchies.filter((h) => !h.has_cycle);
  const cycles = hierarchies.filter((h) => h.has_cycle);

  let largest_tree_root = '';
  if (trees.length > 0) {
    const sorted = [...trees].sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root.localeCompare(b.root);
    });
    largest_tree_root = sorted[0].root;
  }

  return {
    total_trees: trees.length,
    total_cycles: cycles.length,
    largest_tree_root,
  };
}

function processData(data, identity) {
  const { validEdges, invalidEntries, duplicateEdges } = parseEntries(data);
  const { parentOf, childrenOf, nodeFirstSeen } = buildGraph(validEdges);
  const components = findComponents(nodeFirstSeen, parentOf, childrenOf);
  const hierarchies = buildHierarchies(components, parentOf, childrenOf);
  const summary = buildSummary(hierarchies);

  return {
    ...identity,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary,
  };
}

module.exports = { processData };
