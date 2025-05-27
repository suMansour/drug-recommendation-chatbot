const fs = require('fs');
const path = require('path');

// Read the built index.html
const indexPath = path.join(__dirname, '../build/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Inject the API key
const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('REACT_APP_OPENROUTER_API_KEY is not set');
  process.exit(1);
}

// Add the API key to the window object
const script = `
<script>
  window.__OPENROUTER_API_KEY__ = "${apiKey}";
</script>
`;

// Insert the script before the closing head tag
html = html.replace('</head>', `${script}</head>`);

// Write the modified file
fs.writeFileSync(indexPath, html); 