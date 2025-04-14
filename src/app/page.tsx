"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "preview" | "visualize"
  >("upload");

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnTypes, setColumnTypes] = useState<Record<string, string>>({});
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded?.type === "text/csv") {
      setFile(uploaded);
      setMessage(null);
      setUploadSuccess(false);
      setPreviewData([]);
      setColumns([]);
      setColumnTypes({});
    } else {
      setMessage({ text: "Please upload a valid CSV file.", type: "error" });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/file/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (data.previewRows?.length > 0) {
        const firstRow = data.previewRows[0];
        const cols = Object.keys(firstRow);
        const types: Record<string, string> = {};

        cols.forEach((col) => {
          const val = firstRow[col];
          types[col] = !isNaN(Number(val))
            ? "number"
            : val === "true" || val === "false"
            ? "boolean"
            : "string";
        });

        setColumns(cols);
        setColumnTypes(types);
        setPreviewData(data.previewRows);
      }

      setTotalRows(data.rowCount || 0);
      setMessage({
        text: `Uploaded ${data.rowCount} rows successfully! Click "Preview" to continue.`,
        type: "success",
      });
      setUploadSuccess(true);
    } catch (err) {
      setMessage({
        text: "Upload failed. Please try again.",
        type: "error",
      });
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleViewPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const res = await fetch("/api/file/preview");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load preview");
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : { rows: [] };

      if (data.rows?.length > 0) {
        const firstRow = data.rows[0];
        const cols = Object.keys(firstRow);
        const types: Record<string, string> = {};

        cols.forEach((col) => {
          const val = firstRow[col];
          types[col] = !isNaN(Number(val))
            ? "number"
            : val === "true" || val === "false"
            ? "boolean"
            : "string";
        });

        setColumns(cols);
        setColumnTypes(types);
        setPreviewData(data.rows);
        setCurrentStep("preview");
      }
    } catch (error: any) {
      console.error("Preview error:", error);
      setMessage({
        text: error.message || "Failed to load preview data",
        type: "error",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const renderUploadStep = () => (
    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Upload File</h2>
          <p className="text-gray-400">
            Select a CSV file to begin analyzing your data
          </p>
        </div>

        <div
          className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all ${
            file
              ? "border-blue-500 bg-gray-600/30"
              : "border-gray-500 bg-gray-600/10 hover:bg-gray-600/20 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center text-center"
          >
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-gray-300 font-medium">
              {file ? file.name : "Click to select or drag & drop CSV file"}
            </span>
            {file && (
              <span className="text-xs text-gray-500 mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            )}
          </label>
        </div>

        {!uploadSuccess && (
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all ${
              !file || uploading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } flex items-center justify-center`}
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Upload & Preview Data"
            )}
          </button>
        )}

        {message?.text && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-900/30 border border-green-800"
                : "bg-red-900/30 border border-red-800"
            }`}
          >
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-300" : "text-red-300"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {uploadSuccess && (
          <button
            onClick={handleViewPreview}
            disabled={isLoadingPreview}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium transition ${
              isLoadingPreview
                ? "bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoadingPreview ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading Preview...
              </>
            ) : (
              "Preview Data"
            )}
          </button>
        )}
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (isLoadingPreview) {
      return (
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-300">Loading preview data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Step 2: Data Preview
              </h2>
              <p className="text-gray-400">
                Review your data before visualization (
                {Math.min(50, previewData.length)}/{totalRows} rows shown)
              </p>
            </div>
            <button
              onClick={() => setCurrentStep("upload")}
              className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500 text-gray-200 transition flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Upload
            </button>
          </div>

          {previewData.length > 0 ? (
            <div className="overflow-auto max-h-96 border border-gray-600 rounded-lg">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-600 sticky top-0">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {col}{" "}
                        <span className="text-gray-400 text-xs font-normal">
                          ({columnTypes[col]})
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-700 divide-y divide-gray-600">
                  {previewData.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-gray-700" : "bg-gray-700/50"}
                    >
                      {columns.map((col) => (
                        <td
                          key={`${i}-${col}`}
                          className="px-4 py-3 whitespace-nowrap text-sm text-gray-300"
                        >
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-600 p-8 text-center">
              <p className="text-gray-400">No preview data available</p>
            </div>
          )}

          <button
            onClick={() => setCurrentStep("visualize")}
            className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center"
            disabled={previewData.length === 0}
          >
            Visualize Data
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderVisualizeStep = () => {
    const numericColumns = columns.filter(
      (col) => columnTypes[col] === "number"
    );
    const categoricalColumns = columns.filter(
      (col) => columnTypes[col] === "string"
    );

    const barData = previewData
      .map((row) => ({
        name: row[categoricalColumns[0]] || "Item",
        value: row[numericColumns[0]] || 0,
      }))
      .slice(0, 10);

    const pieData =
      categoricalColumns.length > 0
        ? Object.entries(
            previewData.reduce((acc, row) => {
              const key = row[categoricalColumns[0]];
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          )
            .map(([name, value]) => ({ name, value }))
            .slice(0, 5)
        : [];

    const lineData =
      numericColumns.length >= 2
        ? previewData.map((row, i) => ({
            index: i,
            [numericColumns[0]]: row[numericColumns[0]],
            [numericColumns[1]]: row[numericColumns[1]],
          }))
        : [];

    const scatterData =
      numericColumns.length >= 2
        ? previewData.map((row) => ({
            x: row[numericColumns[0]],
            y: row[numericColumns[1]],
          }))
        : [];

    return (
      <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Step 3: Data Visualization
              </h2>
              <p className="text-gray-400">
                Explore your data through interactive charts
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentStep("preview")}
                className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500 text-gray-200 transition flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Preview
              </button>
              <button
                onClick={() => setCurrentStep("upload")}
                className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500 text-gray-200 transition flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                New Upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {numericColumns.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-medium text-white mb-3">
                  {numericColumns[0]} Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#4B5563",
                        }}
                        itemStyle={{ color: "#F3F4F6" }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {pieData.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-medium text-white mb-3">
                  {categoricalColumns[0]} Composition
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#4B5563",
                        }}
                        itemStyle={{ color: "#F3F4F6" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {numericColumns.length >= 2 && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-medium text-white mb-3">
                  {numericColumns[0]} vs {numericColumns[1]}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis dataKey="index" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#4B5563",
                        }}
                        itemStyle={{ color: "#F3F4F6" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={numericColumns[0]}
                        stroke="#3B82F6"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey={numericColumns[1]}
                        stroke="#10B981"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {numericColumns.length >= 2 && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-medium text-white mb-3">
                  {numericColumns[0]} vs {numericColumns[1]} Correlation
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name={numericColumns[0]}
                        stroke="#9CA3AF"
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name={numericColumns[1]}
                        stroke="#9CA3AF"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#4B5563",
                        }}
                        itemStyle={{ color: "#F3F4F6" }}
                        cursor={{ strokeDasharray: "3 3" }}
                      />
                      <Scatter
                        name="Data Points"
                        data={scatterData}
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-600">
            <h3 className="text-lg font-medium text-white mb-3">
              Quick Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {numericColumns.slice(0, 4).map((col) => {
                const values = previewData
                  .map((row) => Number(row[col]))
                  .filter((v) => !isNaN(v));
                const sum = values.reduce((a, b) => a + b, 0);
                const avg = sum / values.length;
                const min = Math.min(...values);
                const max = Math.max(...values);

                return (
                  <div
                    key={col}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-600"
                  >
                    <p className="text-sm text-gray-400">{col}</p>
                    <div className="text-white mt-2 space-y-1">
                      <p className="text-sm">
                        Avg:{" "}
                        <span className="font-medium">{avg.toFixed(2)}</span>
                      </p>
                      <p className="text-sm">
                        Min:{" "}
                        <span className="font-medium">{min.toFixed(2)}</span>
                      </p>
                      <p className="text-sm">
                        Max:{" "}
                        <span className="font-medium">{max.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="text-blue-400">DuckDB</span> Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Upload, preview, and visualize your CSV data in three simple steps
          </p>
        </div>

        <div className="flex mb-6">
          <div
            className={`flex-1 py-3 text-center border-b-2 ${
              currentStep === "upload"
                ? "border-blue-500 text-white"
                : "border-gray-600 text-gray-500"
            }`}
          >
            <span className="flex items-center justify-center">
              {currentStep !== "upload" && (
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              1. Upload
            </span>
          </div>
          <div
            className={`flex-1 py-3 text-center border-b-2 ${
              currentStep === "preview"
                ? "border-blue-500 text-white"
                : currentStep === "visualize"
                ? "border-green-500 text-white"
                : "border-gray-600 text-gray-500"
            }`}
          >
            <span className="flex items-center justify-center">
              {currentStep === "visualize" && (
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              2. Preview
            </span>
          </div>
          <div
            className={`flex-1 py-3 text-center border-b-2 ${
              currentStep === "visualize"
                ? "border-blue-500 text-white"
                : "border-gray-600 text-gray-500"
            }`}
          >
            3. Visualize
          </div>
        </div>

        {currentStep === "upload" && renderUploadStep()}
        {currentStep === "preview" && renderPreviewStep()}
        {currentStep === "visualize" && renderVisualizeStep()}
      </div>
    </main>
  );
}
