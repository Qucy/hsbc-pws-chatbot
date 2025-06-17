import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL connection pool using the provided connection string
const pool = new Pool({
  connectionString: process.env.PGSQL_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

interface ContentRequest {
  source_urls: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { source_urls }: ContentRequest = await request.json();

    if (!source_urls || !Array.isArray(source_urls) || source_urls.length === 0) {
      return NextResponse.json(
        { error: 'source_urls array is required and must not be empty' },
        { status: 400 }
      );
    }

    console.log('Retrieving content for URLs:', source_urls);

    const client = await pool.connect();
    try {
      // Create parameterized query for multiple URLs
      const placeholders = source_urls.map((_, index) => `$${index + 1}`).join(', ');
      const query = `
        SELECT id, filename, file_type, source_url, raw_content, title, description, keywords, word_count, language, created_at
        FROM content 
        WHERE source_url IN (${placeholders})
        ORDER BY created_at DESC
      `;

      console.log('Executing query:', query);
      console.log('Query params:', source_urls);

      const result = await client.query(query, source_urls);
      
      // Log all retrieved raw content
      result.rows.forEach((row, index) => {
        console.log(`\n=== Content ${index + 1} ===`);
        console.log('Source URL:', row.source_url);
        console.log('Title:', row.title);
        console.log('File Type:', row.file_type);
        console.log('Raw Content:');
        // console.log(row.raw_content); // hide content for now as it's too much
        console.log('='.repeat(50));
      });

      const contentData = result.rows.map(row => ({
        id: row.id,
        filename: row.filename,
        file_type: row.file_type,
        source_url: row.source_url,
        raw_content: row.raw_content,
        title: row.title,
        description: row.description,
        keywords: row.keywords,
        word_count: row.word_count,
        language: row.language,
        created_at: row.created_at
      }));

      return NextResponse.json({
        success: true,
        content: contentData,
        count: contentData.length,
        requested_urls: source_urls,
        found_urls: result.rows.map(row => row.source_url)
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Content retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return NextResponse.json({ status: 'Content API database connection healthy' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Content API database health check failed:', error);
    return NextResponse.json(
      { error: 'Content API database connection failed' },
      { status: 500 }
    );
  }
}