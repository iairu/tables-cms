// Vercel API Route - CMS Data Endpoint
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // In production, this would fetch from a database or storage
  // For static deployment, we return the bundled CMS data
  try {
    const cmsData = {
      pages: [],
      pageGroups: [],
      blogArticles: [],
      settings: {},
      extensions: {}
    };

    res.status(200).json(cmsData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CMS data' });
  }
}
