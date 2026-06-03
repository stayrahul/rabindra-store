import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'No SQL query provided' }, { status: 400 });
        }

        // Connect to the Supabase Postgres instance directly
        const client = new Client({
            connectionString: process.env.SUPABASE_DB_URL,
        });

        await client.connect();

        // Execute the raw query
        const result = await client.query(query);

        await client.end();

        // Return the rows and column definitions
        return NextResponse.json({
            rows: result.rows,
            fields: result.fields
        });

    } catch (error: any) {
        console.error("SQL Execution Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}