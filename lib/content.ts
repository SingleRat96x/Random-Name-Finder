import { promises as fs } from 'fs';
import path from 'path';

export interface PageContent {
  title: string;
  paragraphs: string[];
}

export async function getPageContent(pageName: string): Promise<PageContent> {
  try {
    const filePath = path.join(process.cwd(), 'content', `${pageName}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents) as PageContent;
  } catch (error) {
    console.error(`Error loading content for ${pageName}:`, error);
    // Return fallback content
    return {
      title: 'Content Not Found',
      paragraphs: [
        'Sorry, the content for this page is currently unavailable.',
        'Please check back later or contact us if this problem persists.',
      ],
    };
  }
} 