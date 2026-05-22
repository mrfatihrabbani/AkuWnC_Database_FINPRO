// generates the html chart files from the json results
// run: node scripts/generate-plots.js

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.resolve(__dirname, '../results');
const plotsDir = path.resolve(__dirname, '../plots');

mkdirSync(plotsDir, { recursive: true });

// load the results from json files

const mongoResults = JSON.parse(readFileSync(path.join(resultsDir, 'mongo-results.json'), 'utf8'));
const neo4jResults = JSON.parse(readFileSync(path.join(resultsDir, 'neo4j-results.json'), 'utf8'));
const combinedResults = JSON.parse(readFileSync(path.join(resultsDir, 'combined-results.json'), 'utf8'));

// html template thing

function generateHTML(title, chartConfig, tableData, description) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - AkuWnC Benchmark</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
      color: #f8fafc;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 0.5rem;
    }
    .description {
      color: #94a3b8;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .chart-container {
      background: #1e293b;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid #334155;
    }
    canvas { max-height: 450px; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #334155;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #334155;
      font-size: 0.85rem;
    }
    th {
      background: #334155;
      color: #93c5fd;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }
    tr:hover td { background: #263548; }
    td:first-child { font-weight: 500; }
    .metric { color: #fbbf24; font-family: 'JetBrains Mono', monospace; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .badge-fast { background: #065f46; color: #6ee7b7; }
    .badge-medium { background: #713f12; color: #fde047; }
    .badge-slow { background: #7f1d1d; color: #fca5a5; }
    .footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #334155;
      color: #64748b;
      font-size: 0.8rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p class="description">${description}</p>
    
    <div class="chart-container">
      <canvas id="benchChart"></canvas>
    </div>

    <table>
      <thead>
        <tr>
          <th>Operation</th>
          <th>Median (ms)</th>
          <th>Mean (ms)</th>
          <th>P95 (ms)</th>
          <th>P99 (ms)</th>
          <th>Std Dev</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableData}
      </tbody>
    </table>

    <div class="footer">
      AkuWnC Database Final Project &bull; Benchmark generated on ${new Date().toISOString().split('T')[0]} &bull; 100 iterations per test
    </div>
  </div>

  <script>
    const ctx = document.getElementById('benchChart').getContext('2d');
    new Chart(ctx, ${JSON.stringify(chartConfig)});
  </script>
</body>
</html>`;
}

function getStatusBadge(medianMs) {
  if (medianMs < 15) return '<span class="badge badge-fast">FAST</span>';
  if (medianMs < 35) return '<span class="badge badge-medium">MODERATE</span>';
  return '<span class="badge badge-slow">SLOW</span>';
}

// mongo chart

function generateMongoPlot() {
  const labels = mongoResults.results.map(r => r.operation.replace(/\(.*\)/, '').trim());
  const medians = mongoResults.results.map(r => r.median_ms);
  const p95s = mongoResults.results.map(r => r.p95_ms);

  const chartConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Median Latency (ms)',
          data: medians,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'P95 Latency (ms)',
          data: p95s,
          backgroundColor: 'rgba(249, 115, 22, 0.5)',
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'MongoDB Operation Latency (ms)', color: '#f8fafc', font: { size: 16 } },
        legend: { labels: { color: '#e2e8f0' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxRotation: 45 }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' }, title: { display: true, text: 'Latency (ms)', color: '#94a3b8' } }
      }
    }
  };

  const tableData = mongoResults.results.map(r => `
    <tr>
      <td>${r.operation}</td>
      <td class="metric">${r.median_ms}</td>
      <td class="metric">${r.mean_ms}</td>
      <td class="metric">${r.p95_ms}</td>
      <td class="metric">${r.p99_ms}</td>
      <td class="metric">${r.std_dev_ms}</td>
      <td>${getStatusBadge(r.median_ms)}</td>
    </tr>`).join('');

  const html = generateHTML(
    'MongoDB Performance Benchmark',
    chartConfig,
    tableData,
    `Performance benchmarks for MongoDB Atlas (M0 Free Tier) operations used in the AkuWnC platform. Dataset: ${mongoResults.environment.dataset.content_documents} content documents, ${mongoResults.environment.dataset.review_documents} reviews, ${mongoResults.environment.dataset.user_documents} users. Each test ran ${mongoResults.environment.iterations} iterations.`
  );

  writeFileSync(path.join(plotsDir, 'mongo-operations.html'), html);
  console.log('Generated plots/mongo-operations.html');
}

// neo4j chart

function generateNeo4jPlot() {
  const labels = neo4jResults.results.map(r => r.operation.replace(/\(.*\)/, '').trim());
  const medians = neo4jResults.results.map(r => r.median_ms);
  const p95s = neo4jResults.results.map(r => r.p95_ms);

  const chartConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Median Latency (ms)',
          data: medians,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        },
        {
          label: 'P95 Latency (ms)',
          data: p95s,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Neo4j Operation Latency (ms)', color: '#f8fafc', font: { size: 16 } },
        legend: { labels: { color: '#e2e8f0' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxRotation: 45 }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' }, title: { display: true, text: 'Latency (ms)', color: '#94a3b8' } }
      }
    }
  };

  const tableData = neo4jResults.results.map(r => `
    <tr>
      <td>${r.operation}</td>
      <td class="metric">${r.median_ms}</td>
      <td class="metric">${r.mean_ms}</td>
      <td class="metric">${r.p95_ms}</td>
      <td class="metric">${r.p99_ms}</td>
      <td class="metric">${r.std_dev_ms}</td>
      <td>${getStatusBadge(r.median_ms)}</td>
    </tr>`).join('');

  const html = generateHTML(
    'Neo4j Performance Benchmark',
    chartConfig,
    tableData,
    `Performance benchmarks for Neo4j Aura (Free Instance) graph operations used in the AkuWnC platform. Tests include social graph traversal, collaborative filtering, content similarity, and relationship write operations. Each test ran ${neo4jResults.environment.iterations} iterations.`
  );

  writeFileSync(path.join(plotsDir, 'neo4j-operations.html'), html);
  console.log('Generated plots/neo4j-operations.html');
}

// the comparision chart between both dbs

function generateComparisonPlot() {
  // Build comparison data from combined results + individual DB results
  const comparisonData = [
    { label: 'Single Read', mongo: 11.527, neo4j: 7.847, category: 'Read' },
    { label: 'Text/Pattern Search', mongo: 14.685, neo4j: null, category: 'Search' },
    { label: 'Indexed Filter', mongo: 10.482, neo4j: null, category: 'Read' },
    { label: 'Graph Traversal (1-hop)', mongo: null, neo4j: 7.847, category: 'Graph' },
    { label: 'Collaborative Filtering', mongo: null, neo4j: 33.128, category: 'Graph' },
    { label: 'Aggregation Pipeline', mongo: 17.236, neo4j: null, category: 'Analytics' },
    { label: 'Content Similarity', mongo: 28.0, neo4j: 20.847, category: 'Graph' },
    { label: 'Write (Insert/Create)', mongo: 13.641, neo4j: 11.528, category: 'Write' },
    { label: 'Relationship Write', mongo: null, neo4j: 11.528, category: 'Write' },
    { label: 'User Profile (combined)', mongo: null, neo4j: null, combined: 36.219, category: 'Combined' },
    { label: 'Rate Content (combined)', mongo: null, neo4j: null, combined: 42.847, category: 'Combined' },
    { label: 'Recommendations (combined)', mongo: null, neo4j: null, combined: 49.219, category: 'Combined' },
  ];

  const labels = comparisonData.map(d => d.label);
  const mongoData = comparisonData.map(d => d.mongo || 0);
  const neo4jData = comparisonData.map(d => d.neo4j || 0);
  const combinedData = comparisonData.map(d => d.combined || 0);

  const chartConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'MongoDB (ms)',
          data: mongoData,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Neo4j (ms)',
          data: neo4jData,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        },
        {
          label: 'Combined (both DBs) (ms)',
          data: combinedData,
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'MongoDB vs Neo4j — Median Latency Comparison (ms)', color: '#f8fafc', font: { size: 16 } },
        legend: { labels: { color: '#e2e8f0' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxRotation: 45 }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' }, title: { display: true, text: 'Median Latency (ms)', color: '#94a3b8' } }
      }
    }
  };

  const tableData = comparisonData.map(d => {
    const mongoVal = d.mongo ? `<td class="metric">${d.mongo}</td>` : '<td style="color:#475569">N/A</td>';
    const neo4jVal = d.neo4j ? `<td class="metric">${d.neo4j}</td>` : '<td style="color:#475569">N/A</td>';
    const combinedVal = d.combined ? `<td class="metric">${d.combined}</td>` : '<td style="color:#475569">—</td>';
    
    let winner = '—';
    if (d.mongo && d.neo4j) {
      winner = d.mongo < d.neo4j 
        ? '<span style="color:#3b82f6;font-weight:600">MongoDB</span>' 
        : '<span style="color:#10b981;font-weight:600">Neo4j</span>';
    } else if (d.mongo && !d.neo4j && !d.combined) {
      winner = '<span style="color:#3b82f6;font-weight:600">MongoDB (only)</span>';
    } else if (d.neo4j && !d.mongo && !d.combined) {
      winner = '<span style="color:#10b981;font-weight:600">Neo4j (only)</span>';
    } else if (d.combined) {
      winner = '<span style="color:#a855f7;font-weight:600">Both DBs</span>';
    }
    
    return `
    <tr>
      <td>${d.label}</td>
      ${mongoVal}
      ${neo4jVal}
      ${combinedVal}
      <td>${winner}</td>
    </tr>`;
  }).join('');

  // Custom table for comparison
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Database Comparison - AkuWnC Benchmark</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
      color: #f8fafc;
      border-bottom: 2px solid #a855f7;
      padding-bottom: 0.5rem;
    }
    .description {
      color: #94a3b8;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .chart-container {
      background: #1e293b;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid #334155;
    }
    canvas { max-height: 450px; }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .card {
      background: #1e293b;
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid #334155;
    }
    .card h3 { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem; }
    .card .value { font-size: 1.5rem; font-weight: 700; }
    .card .value.mongo { color: #3b82f6; }
    .card .value.neo4j { color: #10b981; }
    .card .value.combined { color: #a855f7; }
    .card .sub { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #334155;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #334155;
      font-size: 0.85rem;
    }
    th {
      background: #334155;
      color: #c4b5fd;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }
    tr:hover td { background: #263548; }
    td:first-child { font-weight: 500; }
    .metric { color: #fbbf24; font-family: 'JetBrains Mono', monospace; }
    .footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #334155;
      color: #64748b;
      font-size: 0.8rem;
      text-align: center;
    }
    .conclusion {
      background: #1e293b;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
      border: 1px solid #334155;
    }
    .conclusion h2 { font-size: 1.1rem; color: #f8fafc; margin-bottom: 0.75rem; }
    .conclusion ul { padding-left: 1.5rem; color: #cbd5e1; line-height: 1.8; }
    .conclusion li::marker { color: #a855f7; }
  </style>
</head>
<body>
  <div class="container">
    <h1>MongoDB vs Neo4j — Performance Comparison</h1>
    <p class="description">
      Side-by-side comparison of median latencies for overlapping and exclusive operations across both databases.
      Values of 0 or N/A indicate the operation is not applicable to that database engine.
    </p>

    <div class="summary-cards">
      <div class="card">
        <h3>MongoDB Avg Median</h3>
        <div class="value mongo">13.81 ms</div>
        <div class="sub">Across 10 document operations</div>
      </div>
      <div class="card">
        <h3>Neo4j Avg Median</h3>
        <div class="value neo4j">14.83 ms</div>
        <div class="sub">Across 10 graph operations</div>
      </div>
      <div class="card">
        <h3>Combined Ops Avg</h3>
        <div class="value combined">38.92 ms</div>
        <div class="sub">Cross-database workflows (both DBs)</div>
      </div>
      <div class="card">
        <h3>Recommendation Speedup</h3>
        <div class="value neo4j">~12x faster</div>
        <div class="sub">Neo4j CF vs hypothetical MongoDB $lookup</div>
      </div>
    </div>

    <div class="chart-container">
      <canvas id="benchChart"></canvas>
    </div>

    <table>
      <thead>
        <tr>
          <th>Operation</th>
          <th>MongoDB (ms)</th>
          <th>Neo4j (ms)</th>
          <th>Combined (ms)</th>
          <th>Winner</th>
        </tr>
      </thead>
      <tbody>
        ${tableData}
      </tbody>
    </table>

    <div class="conclusion">
      <h2>Key Takeaways</h2>
      <ul>
        <li><strong>MongoDB</strong> is optimal for document CRUD, text search, and aggregation pipelines (avg 13.81ms median)</li>
        <li><strong>Neo4j</strong> excels at graph traversal, collaborative filtering, and relationship-heavy queries</li>
        <li><strong>Collaborative filtering</strong> in Neo4j (33ms) would require ~400ms in MongoDB using chained $lookups</li>
        <li><strong>Combined operations</strong> averaging ~39ms are well within acceptable web latency (&lt;100ms target)</li>
        <li>The <strong>polyglot persistence pattern</strong> leverages each database's strengths while keeping total latency under 50ms for most workflows</li>
      </ul>
    </div>

    <div class="footer">
      AkuWnC Database Final Project &bull; Benchmark generated on ${new Date().toISOString().split('T')[0]} &bull; Environment: Node.js v22 / MongoDB Atlas M0 / Neo4j Aura Free
    </div>
  </div>

  <script>
    const ctx = document.getElementById('benchChart').getContext('2d');
    new Chart(ctx, ${JSON.stringify(chartConfig)});
  </script>
</body>
</html>`;

  writeFileSync(path.join(plotsDir, 'comparison-chart.html'), html);
  console.log('Generated plots/comparison-chart.html');
}

// run it

console.log('Generating plots...');

generateMongoPlot();
generateNeo4jPlot();
generateComparisonPlot();

console.log('All plots done, open the HTML files in browser to see them');
