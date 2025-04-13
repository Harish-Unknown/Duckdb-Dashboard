'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded?.type === 'text/csv') {
      setFile(uploaded);
      setMessage('');
    } else {
      setMessage('Please upload a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/file/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setMessage(`Uploaded and processed ${data?.rows || 0} rows successfully!`);
    } catch (err) {
      setMessage('Something went wrong while uploading.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-600 text-center">DuckDB Dashboard</h1>
        <p className="text-gray-600 text-center">Upload your CSV files and start exploring your data.</p>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-100">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer text-gray-600 font-medium">
            {file ? `Selected: ${file.name}` : 'Click to select a CSV file'}
          </label>
          {file && (
            <p className="text-sm text-gray-500 mt-2">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 px-6 rounded-xl text-white bg-gray-700 hover:bg-gray-800 transition disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload & Process CSV'}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
        )}
      </div>
    </main>
  );
}
