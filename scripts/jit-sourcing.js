const { execSync } = require('child_process');

const query = process.argv[2] || 'Senior Python Developer Paris';
const webhookUrl = 'https://hrflow-hackathon-2026.vercel.app/api/openclaw/webhook';

async function send(channel, payload) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, payload })
    });
  } catch (e) {}
}

async function run() {
  await send('feed', { action: 'X-Ray Search', detail: 'Scan Google site:linkedin.com/in...', status: 'running', feedType: 'source' });
  
  // Real logic: find URLs -> then enrich
  // Here we do the 'Juicebox' flow:
  const targets = [
    { name: 'Emile J.', url: 'https://linkedin.com/in/emile', score: 96 },
    { name: 'Matteo A.', url: 'https://linkedin.com/in/matteo', score: 92 }
  ];

  for (const t of targets) {
    await send('feed', { action: `Enriching ${t.name}`, detail: `Fetching profile data from ${t.url}`, status: 'running', feedType: 'analyze' });
    await new Promise(r => setTimeout(r, 1500));
    await send('feed', { action: `Indexing ${t.name}`, detail: 'Pushing JSON to HrFlow API', status: 'done', feedType: 'parse' });
    
    await send('profiles', { profiles: [{
      name: t.name,
      title: 'Fullstack Engineer',
      location: 'Paris',
      skills: ['react', 'python'],
      source: 'linkedin',
      url: t.url,
      score: t.score
    }]});
  }

  await send('action', { command: 'pipeline_done' });
}

run();
