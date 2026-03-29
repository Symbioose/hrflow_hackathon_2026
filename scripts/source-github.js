const { execSync } = require('child_process');

const query = process.argv[2] || 'python location:paris';
const webhookUrl = 'https://hrflowhackathon2026.vercel.app/api/openclaw/webhook';

async function sendEvent(channel, payload) {
  try {
    // We try localhost first if we were running it locally, 
    // but here we must use the deployed URL or find why it 404s.
    // For the hackathon, let's assume the user might have a local dev server.
    const urls = [
      webhookUrl,
      'http://localhost:3000/api/openclaw/webhook'
    ];
    
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel, payload })
        });
        if (res.ok) return true;
      } catch (e) {}
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function run() {
  console.log(`Sourcing real GitHub profiles for: ${query}`);
  
  await sendEvent('chat', { type: 'agent', text: `Je lance un vrai sourcing GitHub pour "${query}"...` });
  await sendEvent('feed', { action: 'Sourcing GitHub', detail: `Query: ${query}`, status: 'running', feedType: 'source' });

  try {
    const encodedQuery = encodeURIComponent(query);
    const cmd = `gh api -X GET "/search/users?q=${encodedQuery}" --jq ".items[0:5]"`;
    const searchRes = execSync(cmd).toString();
    const users = JSON.parse(searchRes);

    if (users.length === 0) {
      await sendEvent('feed', { action: 'Sourcing GitHub', detail: 'Aucun profil trouvé', status: 'error', feedType: 'source' });
      return;
    }

    await sendEvent('feed', { action: 'Sourcing GitHub', detail: `${users.length} profils trouvés`, status: 'done', feedType: 'source' });
    
    for (const user of users) {
      const detailsRes = execSync(`gh api users/${user.login}`).toString();
      const details = JSON.parse(detailsRes);
      
      await sendEvent('feed', { 
        action: `Indexation ${details.login}`, 
        detail: `${details.name || details.login} (${details.location || 'N/A'})`, 
        status: 'done', 
        feedType: 'parse' 
      });
    }

    await sendEvent('action', { command: 'set_cv_count', text: String(users.length) });
    await sendEvent('action', { command: 'fetch_profiles' });
    await sendEvent('chat', { type: 'agent', text: `GitHub : ${users.length} profils réels identifiés et envoyés au scoring HrFlow.` });

  } catch (e) {
    console.error(e);
    await sendEvent('feed', { action: 'Sourcing GitHub', detail: 'Erreur API GitHub', status: 'error', feedType: 'source' });
  }
}

run();
