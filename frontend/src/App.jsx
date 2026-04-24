import { useState } from 'react';
import './App.css';

const SAMPLE = `A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I
hello
1->2
A->`;

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';

function TreeNode({ label, children, isRoot }) {
  const childEntries = Object.entries(children || {});
  return (
    <div>
      <div className="tree-node">
        <span className="tree-bullet">{isRoot ? '●' : '▸'}</span>
        <span className={`tree-label ${isRoot ? 'is-root' : ''}`}>{label}</span>
      </div>
      {childEntries.length > 0 && (
        <div className="tree-children">
          {childEntries.map(([key, sub]) => (
            <TreeNode key={key} label={key} children={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

function Hierarchy({ item }) {
  const isCycle = item.has_cycle;
  const treeRoot = item.tree && Object.keys(item.tree)[0];

  return (
    <div className="hierarchy-card">
      <div className="hierarchy-head">
        <div className="hierarchy-head-left">
          <span className="root-label">Root</span>
          <span className="root-value">{item.root}</span>
          <span className={`tag ${isCycle ? 'cycle' : 'tree'}`}>
            {isCycle ? 'Cycle' : 'Tree'}
          </span>
        </div>
        {!isCycle && (
          <span className="depth">depth: {item.depth}</span>
        )}
      </div>
      {isCycle ? (
        <div className="cycle-empty">
          {'{}'} — cyclic group, no tree structure
        </div>
      ) : (
        <div className="tree">
          <TreeNode
            label={treeRoot}
            children={item.tree[treeRoot]}
            isRoot
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState(SAMPLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const parseInput = (text) =>
    text.split(/\r?\n|,/).map((s) => s).filter((s) => s.length > 0);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parseInput(input) }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API returned ${res.status}: ${text}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to reach API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Hierarchy Builder</h1>
        <p className="subtitle">
          Enter edges like <code style={{ fontFamily: 'var(--mono)' }}>A-&gt;B</code>, one per line.
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <span className="card-title">Input</span>
        </div>
        <textarea
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="A->B&#10;A->C&#10;B->D"
        />
        <div className="actions">
          <button
            className="btn"
            onClick={handleSubmit}
            disabled={loading || input.trim().length === 0}
          >
            {loading ? 'Processing…' : 'Submit'}
          </button>
          <button
            className="btn secondary"
            onClick={() => setInput(SAMPLE)}
            disabled={loading}
          >
            Load Sample
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              setInput('');
              setResult(null);
              setError(null);
            }}
            disabled={loading}
          >
            Clear
          </button>
        </div>
        {error && <div className="error">⚠ {error}</div>}
      </section>

      {result && (
        <>
          <section className="card">
            <div className="card-header">
              <span className="card-title">Identity</span>
            </div>
            <div className="identity">
              <div className="identity-item">
                <span className="identity-label">user_id</span>
                <span className="identity-value">{result.user_id}</span>
              </div>
              <div className="identity-item">
                <span className="identity-label">email_id</span>
                <span className="identity-value">{result.email_id}</span>
              </div>
              <div className="identity-item">
                <span className="identity-label">roll_number</span>
                <span className="identity-value">{result.college_roll_number}</span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">Summary</span>
            </div>
            <div className="summary-grid">
              <div className="stat">
                <div className="stat-label">Total Trees</div>
                <div className="stat-value accent">{result.summary.total_trees}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Total Cycles</div>
                <div className="stat-value amber">{result.summary.total_cycles}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Largest Tree Root</div>
                <div className="stat-value">
                  {result.summary.largest_tree_root || '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">
                Hierarchies ({result.hierarchies.length})
              </span>
            </div>
            {result.hierarchies.length === 0 ? (
              <div className="empty-state">No hierarchies built.</div>
            ) : (
              result.hierarchies.map((h, i) => (
                <Hierarchy key={`${h.root}-${i}`} item={h} />
              ))
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">
                Invalid Entries ({result.invalid_entries.length})
              </span>
            </div>
            {result.invalid_entries.length === 0 ? (
              <div className="empty-state">None.</div>
            ) : (
              <div className="pill-list">
                {result.invalid_entries.map((e, i) => (
                  <span key={i} className="pill invalid">
                    {e || '∅'}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <span className="card-title">
                Duplicate Edges ({result.duplicate_edges.length})
              </span>
            </div>
            {result.duplicate_edges.length === 0 ? (
              <div className="empty-state">None.</div>
            ) : (
              <div className="pill-list">
                {result.duplicate_edges.map((e, i) => (
                  <span key={i} className="pill duplicate">
                    {e}
                  </span>
                ))}
              </div>
            )}
          </section>
        </>
      )}

    </div>
  );
}
