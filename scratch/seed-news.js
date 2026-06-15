const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  console.log("Seeding Medical News...");

  const newsItems = [
    {
      id: "news_001",
      title: "New WHO Guidelines on Global Pandemic Preparedness Released",
      content: "The World Health Organization has issued a comprehensive framework for proactive pandemic response, emphasizing regional cooperation and rapid diagnostics deployment. The guidelines are expected to shape national health policies globally over the next decade.",
      category: "Global Health",
      source: "WHO Official Press",
      publishedAt: new Date().toISOString()
    },
    {
      id: "news_002",
      title: "Breakthrough in mRNA Cardiology Treatments",
      content: "Researchers have successfully demonstrated the use of targeted mRNA therapies to regenerate heart tissue post-myocardial infarction in clinical trials. The novel approach reduces scar tissue formation by 40% compared to traditional therapies.",
      category: "Cardiology",
      source: "Journal of Cardiovascular Medicine",
      publishedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "news_003",
      title: "FDA Approves First Non-Invasive Continuous Glucose Monitor for Pediatrics",
      content: "A major milestone in pediatric endocrinology: The FDA has granted approval for a wearable, non-invasive glucose monitor suitable for children under 5. This eliminates the need for daily finger pricks and provides real-time alerts to parents via smartphone apps.",
      category: "Pediatrics",
      source: "FDA Newsroom",
      publishedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  for (const item of newsItems) {
    const query = `
      INSERT INTO "MedicalNews" (id, title, content, category, source, "publishedAt") 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING;
    `;
    await client.query(query, [item.id, item.title, item.content, item.category, item.source, item.publishedAt]);
  }

  console.log("News Seeded Successfully!");
  await client.end();
}

main().catch(console.error);
