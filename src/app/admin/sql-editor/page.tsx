"use client";

import React, { useState } from 'react';

export default function SQLEditor() {
    const [query, setQuery] = useState('SELECT * FROM products LIMIT 10;');
    const [results, setResults] = useState<any[] | null>(null);
    const [fields, setFields] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const runQuery = async () => {
        setLoading(true);
        setError(null);
        setResults(null);
        setFields(null);

        try {
            const response = await fetch('/api/run-sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to execute query');
            }

            setResults(data.rows);
            setFields(data.fields);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Supabase SQL Editor</h1>

            {/* Editor Area */}
            <div className="mb-4">
                <textarea
                    className="w-full h-40 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your SQL query here..."
                />
            </div>

            <button
                onClick={runQuery}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Running...' : 'Run Query'}
            </button>

            {/* Error Display */}
            {error && (
                <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p className="font-bold">Error executing query:</p>
                    <p className="font-mono text-sm mt-1">{error}</p>
                </div>
            )}

            {/* Results Display */}
            {results && fields && (
                <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                {fields.map((field, idx) => (
                                    <th key={idx} className="px-4 py-3 font-semibold text-gray-700">
                                        {field.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan={fields.length} className="px-4 py-8 text-center text-gray-500">
                                        Query returned no rows.
                                    </td>
                                </tr>
                            ) : (
                                results.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-gray-50">
                                        {fields.map((field, colIdx) => (
                                            <td key={colIdx} className="px-4 py-3 text-gray-800">
                                                {/* Format objects/arrays properly for display */}
                                                {typeof row[field.name] === 'object'
                                                    ? JSON.stringify(row[field.name])
                                                    : String(row[field.name] ?? 'NULL')}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}