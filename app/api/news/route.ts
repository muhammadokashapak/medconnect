import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const GET = async () => {
  try {
    const parser = new Parser();
    
    // Using WHO (World Health Organization) official English news feed
    const feed = await parser.parseURL('https://www.who.int/rss-feeds/news-english.xml');
    
    // Map items to a standard format and limit to top 20
    const items = feed.items.slice(0, 20).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet || item.content || "Read more at the official source.",
      source: "World Health Organization (WHO)"
    }));

    return NextResponse.json({
      title: feed.title,
      items
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch medical news." }, { status: 500 });
  }
};
