import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig.js";
import ReactMarkdown from "react-markdown";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

export default function Documentation() {
  const { isDark } = useTheme();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // Track which repo is generating
  const [documentation, setDocumentation] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [copied, setCopied] = useState(false); // Track copy feedback

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const res = await api.get(`/api/github/repos`);

      setRepos(res.data || []);
    } catch (err) {
      console.error("Failed to fetch repositories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocumentation = async (owner, repo) => {
    try {
      setGenerating(`${owner}/${repo}`);

      const res = await api.post(`/api/github/repos/generate-documentation`, {
        owner,
        repo,
      });

      setDocumentation(res.data);
      setSelectedRepo(`${owner}/${repo}`);
    } catch (err) {
      console.error("Failed to generate documentation:", err);
      alert("Failed to generate documentation. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const downloadDocumentation = () => {
    if (!documentation) return;

    const element = document.createElement("a");
    const file = new Blob([documentation.documentation], {
      type: "text/markdown",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${documentation.repo}-documentation.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    if (!documentation) return;

    navigator.clipboard
      .writeText(documentation.documentation)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(() => {
        alert("Failed to copy to clipboard");
      });
  };

  return (
    <Layout>
      <div
        className={`p-8 ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        } min-h-screen transition-colors`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              } mb-2`}
            >
              📚 Documentation Generator
            </h1>
            <p
              className={`${
                isDark ? "text-slate-400" : "text-slate-600"
              } text-lg`}
            >
              Generate professional documentation for your repositories using AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Repositories List */}
            <div className="lg:col-span-1">
              <div
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } rounded-xl border shadow-sm overflow-hidden`}
              >
                <div
                  className={`p-6 border-b ${
                    isDark ? "border-slate-700" : "border-slate-200"
                  }`}
                >
                  <h2
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Your Repositories
                  </h2>
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    } mt-1`}
                  >
                    {repos.length} repositories
                  </p>
                </div>

                {loading ? (
                  <div className="p-6 text-center">
                    <div
                      className={`inline-block w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin`}
                    ></div>
                    <p
                      className={`mt-4 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Loading repositories...
                    </p>
                  </div>
                ) : repos.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {repos.map((repo) => {
                      const repoFullName = `${
                        repo.owner?.login || repo.owner
                      }/${repo.name}`;
                      const isSelected = selectedRepo === repoFullName;
                      const isGenerating = generating === repoFullName;

                      return (
                        <div
                          key={repo.id}
                          className={`p-4 border-b ${
                            isDark ? "border-slate-700" : "border-slate-200"
                          } cursor-pointer transition-colors ${
                            isSelected
                              ? isDark
                                ? "bg-slate-700"
                                : "bg-purple-50"
                              : isDark
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => setSelectedRepo(repoFullName)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-semibold truncate ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {repo.name}
                              </h3>
                              <p
                                className={`text-xs ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                } truncate`}
                              >
                                {repo.owner?.login || repo.owner}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateDocumentation(
                                  repo.owner?.login || repo.owner,
                                  repo.name
                                );
                              }}
                              disabled={isGenerating}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                isGenerating
                                  ? isDark
                                    ? "bg-slate-600 text-slate-300"
                                    : "bg-slate-300 text-slate-500"
                                  : isDark
                                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                                  : "bg-purple-600 hover:bg-purple-700 text-white"
                              }`}
                            >
                              {isGenerating ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                  Gen...
                                </span>
                              ) : (
                                "Generate"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <svg
                      className={`w-12 h-12 ${
                        isDark ? "text-slate-600" : "text-slate-300"
                      } mx-auto mb-3`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                    <p
                      className={`${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      No repositories found
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation Preview */}
            <div className="lg:col-span-2">
              {documentation ? (
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl border shadow-sm overflow-hidden flex flex-col h-full`}
                >
                  {/* Header */}
                  <div
                    className={`p-6 border-b ${
                      isDark ? "border-slate-700" : "border-slate-200"
                    } bg-linear-to-r from-purple-600 to-indigo-600 text-white`}
                  >
                    <h2 className="text-2xl font-bold mb-2">
                      {documentation.repo}
                    </h2>
                    <p className="text-purple-100 text-sm">
                      Generated documentation
                    </p>
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 overflow-y-auto p-6 ${
                      isDark ? "bg-slate-800" : "bg-white"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className={`text-3xl font-bold mt-6 mb-4 ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className={`text-2xl font-bold mt-5 mb-3 ${
                              isDark ? "text-white" : "text-slate-900"
                            } border-b ${
                              isDark ? "border-slate-700" : "border-slate-200"
                            } pb-2`}
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className={`text-xl font-bold mt-4 mb-2 ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                            {...props}
                          />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4
                            className={`text-lg font-semibold mt-3 mb-2 ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className={`mb-3 leading-relaxed ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className={`list-disc list-inside mb-4 space-y-2 ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className={`list-decimal list-inside mb-4 space-y-2 ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className={`ml-2 ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                            {...props}
                          />
                        ),
                        code: ({ node, inline, ...props }) => {
                          if (inline) {
                            return (
                              <code
                                className={`px-2 py-1 rounded text-sm font-mono ${
                                  isDark
                                    ? "bg-slate-700 text-purple-300"
                                    : "bg-slate-100 text-purple-700"
                                }`}
                                {...props}
                              />
                            );
                          }
                          return (
                            <code
                              className={`block p-3 rounded-lg mb-4 text-sm font-mono overflow-x-auto ${
                                isDark
                                  ? "bg-slate-900 text-slate-200 border border-slate-700"
                                  : "bg-slate-50 text-slate-900 border border-slate-200"
                              }`}
                              {...props}
                            />
                          );
                        },
                        pre: ({ node, ...props }) => (
                          <pre
                            className={`p-4 rounded-lg mb-4 overflow-x-auto text-sm font-mono ${
                              isDark
                                ? "bg-slate-900 border border-slate-700 text-slate-200"
                                : "bg-slate-50 border border-slate-200 text-slate-900"
                            }`}
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className={`border-l-4 pl-4 py-2 mb-4 italic ${
                              isDark
                                ? "border-purple-500 text-slate-300"
                                : "border-purple-500 text-slate-600"
                            }`}
                            {...props}
                          />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className={`font-semibold underline transition-colors ${
                              isDark
                                ? "text-purple-400 hover:text-purple-300"
                                : "text-purple-600 hover:text-purple-700"
                            }`}
                            {...props}
                          />
                        ),
                        table: ({ node, ...props }) => (
                          <table
                            className={`w-full border-collapse mb-4 rounded-lg overflow-hidden border ${
                              isDark ? "border-slate-700" : "border-slate-200"
                            }`}
                            {...props}
                          />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className={`p-3 text-left font-semibold ${
                              isDark
                                ? "bg-slate-700 text-white"
                                : "bg-slate-100 text-slate-900"
                            } border ${
                              isDark ? "border-slate-600" : "border-slate-200"
                            }`}
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className={`p-3 border ${
                              isDark
                                ? "border-slate-700 text-slate-300"
                                : "border-slate-200 text-slate-700"
                            }`}
                            {...props}
                          />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr
                            className={`my-6 ${
                              isDark ? "border-slate-700" : "border-slate-200"
                            }`}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {documentation.documentation}
                    </ReactMarkdown>
                  </div>

                  {/* Footer with Download Button */}
                  <div
                    className={`p-6 border-t ${
                      isDark
                        ? "border-slate-700 bg-linear-to-r from-slate-800 to-slate-700"
                        : "border-slate-200 bg-linear-to-r from-slate-50 to-slate-100"
                    } flex justify-end gap-3`}
                  >
                    <button
                      onClick={() => setDocumentation(null)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isDark
                          ? "bg-slate-700 hover:bg-slate-600 text-white"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                      }`}
                    >
                      Clear
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        copied
                          ? isDark
                            ? "bg-green-600 text-white"
                            : "bg-green-500 text-white"
                          : isDark
                          ? "bg-slate-600 hover:bg-slate-500 text-white"
                          : "bg-slate-300 hover:bg-slate-400 text-slate-900"
                      }`}
                    >
                      {copied ? "✓ Copied!" : "📋 Copy MD"}
                    </button>
                    <button
                      onClick={downloadDocumentation}
                      className="px-4 py-2 rounded-lg font-semibold bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all"
                    >
                      📥 Download MD
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200"
                  } rounded-xl border shadow-sm p-12 text-center h-full flex flex-col items-center justify-center`}
                >
                  <svg
                    className={`w-16 h-16 ${
                      isDark ? "text-slate-600" : "text-slate-300"
                    } mb-4`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z" />
                  </svg>
                  <h3
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    } mb-2`}
                  >
                    Select a Repository
                  </h3>
                  <p
                    className={`${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Choose a repository from the left and click "Generate" to
                    create professional documentation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
