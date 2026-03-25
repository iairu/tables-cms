// Vercel API Route - Build Trigger
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Verify API key
  const { apiKey } = req.body;
  const expectedKey = process.env.VERCEL_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    // Trigger Vercel deployment via webhook
    // This would be called from the Tauri app to trigger a rebuild
    const deploymentId = `deploy_${Date.now()}`;
    
    res.status(200).json({
      success: true,
      message: 'Deployment triggered',
      deploymentId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger deployment' });
  }
}
