"use client";

import React, { useState, useEffect } from "react";
import { Collection, Request } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  generateCurlSnippet,
  generateHttpSnippet,
  generateJsFetchSnippet,
  generateNodeAxiosSnippet,
  generatePythonRequestsSnippet,
  generateJavaOkHttpSnippet,
  generateCSharpHttpClientSnippet,
  generateGoNativeSnippet,
  generateSwiftUrlSessionSnippet,
  generatePhpCurlSnippet,
  generateDartHttpSnippet,
} from "@/modules/request/utils/snippet-generators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Check, Copy, Download, FileJson, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocsContentProps {
  collection: Collection & { requests: Request[] };
}

function formatDescription(text: string | null | undefined) {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")       // Remove bold stars
    .replace(/__/g, "")         // Remove bold underscores
    .replace(/—/g, ", ")        // Replace unicode em-dash with a comma
    .replace(/–/g, ", ")        // Replace unicode en-dash with a comma
    .replace(/-{2,}/g, ", ");   // Replace double/triple standard dashes with a comma
}

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-500 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PATCH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  QUERY: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

const languages = [
  { id: "curl", name: "cURL", generator: generateCurlSnippet },
  { id: "http", name: "HTTP", generator: generateHttpSnippet },
  { id: "js-fetch", name: "JavaScript (Fetch)", generator: generateJsFetchSnippet },
  { id: "node-axios", name: "Node.js (Axios)", generator: generateNodeAxiosSnippet },
  { id: "python", name: "Python (Requests)", generator: generatePythonRequestsSnippet },
  { id: "java", name: "Java (OkHttp)", generator: generateJavaOkHttpSnippet },
  { id: "csharp", name: "C# (HttpClient)", generator: generateCSharpHttpClientSnippet },
  { id: "go", name: "Go (Native)", generator: generateGoNativeSnippet },
  { id: "swift", name: "Swift (URLSession)", generator: generateSwiftUrlSessionSnippet },
  { id: "php", name: "PHP (cURL)", generator: generatePhpCurlSnippet },
  { id: "dart", name: "Dart (http)", generator: generateDartHttpSnippet },
];

export default function DocsContent({ collection }: DocsContentProps) {
  const [activeRequest, setActiveRequest] = useState<string>(
    collection.requests[0]?.id || ""
  );

  const downloadAsMarkdown = () => {
    let md = `# ${collection.name}\n\n`;
    if (collection.description) {
      md += `${collection.description}\n\n`;
    }
    
    collection.requests.forEach(req => {
      md += `## ${req.name || "Untitled Request"}\n\n`;
      md += `**Method:** ${req.method}\n\n`;
      md += `**URL:** \`${req.url}\`\n\n`;
      if (req.description) {
        md += `${req.description}\n\n`;
      }
      
      const queryParams = Array.isArray(req.parameters) ? (req.parameters as any[]).filter(p => p.key) : [];
      if (queryParams.length > 0) {
        md += `### Query Parameters\n\n`;
        md += `| Parameter | Value |\n| --- | --- |\n`;
        queryParams.forEach(p => {
          md += `| \`${p.key}\` | ${p.value || ""} |\n`;
        });
        md += `\n`;
      }
      
      const headers = Array.isArray(req.headers) ? (req.headers as any[]).filter(h => h.key) : [];
      if (headers.length > 0) {
        md += `### Headers\n\n`;
        md += `| Header | Value |\n| --- | --- |\n`;
        headers.forEach(h => {
          md += `| \`${h.key}\` | ${h.value || ""} |\n`;
        });
        md += `\n`;
      }
      
      if (req.bodyContentType && req.bodyContentType !== "NONE") {
        md += `### Body (${req.bodyContentType})\n\n`;
        if (req.body) {
           let bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
           md += `\`\`\`${req.bodyContentType === 'JSON' ? 'json' : ''}\n${bodyStr}\n\`\`\`\n\n`;
        }
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_docs.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsJson = () => {
    const exportData = {
      name: collection.name,
      description: collection.description,
      requests: collection.requests.map(req => ({
        name: req.name,
        description: req.description,
        method: req.method,
        url: req.url,
        parameters: req.parameters,
        headers: req.headers,
        authorization: req.authorization,
        bodyContentType: req.bodyContentType,
        body: req.body,
        preRequestScript: req.preRequestScript,
        testScript: req.testScript,
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_docs.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[data-request-id]");
      let currentId = "";
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Adjust the offset as needed based on header height, etc.
        if (rect.top <= 150 && rect.bottom >= 150) {
          currentId = section.getAttribute("data-request-id") || "";
        }
      });
      
      if (currentId && currentId !== activeRequest) {
        setActiveRequest(currentId);
      }
    };

    const mainContent = document.getElementById("docs-main-scroll");
    mainContent?.addEventListener("scroll", handleScroll);
    return () => mainContent?.removeEventListener("scroll", handleScroll);
  }, [activeRequest]);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex w-full h-full">
      {/* Sidebar Navigation */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-zinc-800 shrink-0">
          <h1 className="font-bold text-xl truncate">{collection.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">API Documentation</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-1">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
              Endpoints
            </h3>
            {collection.requests.map((req) => (
              <a
                key={req.id}
                href={`#req-${req.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`req-${req.id}`)?.scrollIntoView({ behavior: "smooth" });
                  setActiveRequest(req.id);
                }}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeRequest === req.id
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-12 text-center ${
                    methodColors[req.method] || "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {req.method}
                </span>
                <span className="truncate">{req.name || "Untitled Request"}</span>
              </a>
            ))}
          </div>
        </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className="bg-zinc-800 hover:bg-zinc-700 transition-colors" />

      {/* Main Content Area */}
      <ResizablePanel defaultSize={80} className="bg-zinc-950">
        <ScrollArea id="docs-main-scroll" className="h-full w-full relative">
          <div className="max-w-7xl mx-auto">
          {/* Collection Intro */}
          <div className="px-10 py-16 border-b border-zinc-800/50 flex justify-between items-start">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
              {collection.description ? (
                <div className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {formatDescription(collection.description)}
                </div>
              ) : (
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Explore the API documentation for {collection.name}. This documentation is automatically generated from the collection's requests and parameters.
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 shadow-xl w-48">
                  <DropdownMenuItem className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 py-2" onClick={downloadAsMarkdown}>
                    <FileText className="w-4 h-4 mr-3 text-zinc-400" />
                    Markdown (.md)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 py-2" onClick={downloadAsJson}>
                    <FileJson className="w-4 h-4 mr-3 text-zinc-400" />
                    JSON (.json)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Requests Iteration */}
          <div>
            {collection.requests.map((req, index) => (
              <RequestSection key={req.id} request={req} isLast={index === collection.requests.length - 1} />
            ))}
          </div>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function RequestSection({ request, isLast }: { request: Request; isLast: boolean }) {
  const [selectedLang, setSelectedLang] = useState(languages[0].id);

  // Parse parameters
  const queryParams = Array.isArray(request.parameters)
    ? (request.parameters as any[]).filter((p) => p.key && p.enabled !== false)
    : [];

  const headers = Array.isArray(request.headers)
    ? (request.headers as any[]).filter((h) => h.key && h.enabled !== false)
    : [];

  // Safely parse body if JSON
  let bodyContent = request.body as string;
  let parsedBody: any = null;
  if (request.bodyContentType === "JSON") {
    try {
      parsedBody = JSON.parse(request.body as string);
      bodyContent = JSON.stringify(parsedBody, null, 2);
    } catch {
      // ignore
    }
  }

  const activeLang = languages.find((l) => l.id === selectedLang) || languages[0];

  const snippetCode = activeLang.generator({
    method: request.method,
    url: request.url || "https://api.example.com",
    headers: headers,
    body: typeof request.body === 'string' ? request.body : JSON.stringify(request.body) || "",
  });

  return (
    <section
      id={`req-${request.id}`}
      data-request-id={request.id}
      className={`px-10 py-20 flex flex-col xl:flex-row gap-12 ${
        !isLast ? "border-b border-zinc-800/50" : ""
      }`}
    >
      {/* Left Column: Docs & Params */}
      <div className="flex-1 xl:max-w-3xl space-y-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Badge
              variant="outline"
              className={`text-sm font-bold tracking-wider px-2.5 py-1 uppercase rounded-md ${
                methodColors[request.method] || "bg-zinc-800 text-zinc-400"
              }`}
            >
              {request.method}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">
              {request.name || "Untitled Request"}
            </h2>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-md p-3 font-mono text-sm break-all flex items-center">
            <span className="text-zinc-500 mr-2 uppercase text-xs">{request.method}</span>
            <span className="text-zinc-200">{request.url || "https://api.example.com"}</span>
          </div>
          {request.description && (
            <div className="mt-6 text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {formatDescription(request.description)}
            </div>
          )}
        </div>

        {/* Query Parameters */}
        {queryParams.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-100">Query Parameters</h3>
            <div className="rounded-md border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Parameter</th>
                    <th className="px-4 py-3 font-medium">Description / Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                  {queryParams.map((p, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-mono text-indigo-300">{p.key}</td>
                      <td className="px-4 py-3 text-zinc-300">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Headers */}
        {headers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-100">Headers</h3>
            <div className="rounded-md border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Header</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                  {headers.map((h, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-mono text-indigo-300">{h.key}</td>
                      <td className="px-4 py-3 text-zinc-300 break-all">{h.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Body Description (If we had schema, it would go here. For now, just a note) */}
        {request.bodyContentType && request.bodyContentType !== "NONE" && (
           <div className="space-y-4">
             <h3 className="text-lg font-semibold text-zinc-100">Body</h3>
             <p className="text-sm text-zinc-400">
               Content-Type: <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">{request.bodyContentType === 'JSON' ? 'application/json' : request.bodyContentType}</code>
             </p>
           </div>
        )}

      </div>

      {/* Right Column: Code Snippets & Examples */}
      <div className="xl:w-[450px] 2xl:w-[550px] flex-shrink-0 space-y-6">
        
        {/* Request Snippet */}
        <div className="bg-[#1e1e1e] border border-zinc-800/80 rounded-lg overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400 tracking-wider">REQUEST</span>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-[180px] h-7 text-xs bg-transparent border-none text-zinc-300 focus:ring-0">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="text-xs">
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative group">
            <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed">
              <code>{snippetCode}</code>
            </pre>
            <CopyButton text={snippetCode} />
          </div>
        </div>

        {/* Request Body Example (if present) */}
        {bodyContent && (
           <div className="bg-[#1e1e1e] border border-zinc-800/80 rounded-lg overflow-hidden shadow-xl">
             <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800">
               <span className="text-xs font-semibold text-zinc-400 tracking-wider">BODY EXAMPLE</span>
             </div>
             <div className="relative group max-h-[400px] overflow-y-auto">
               <pre className="p-4 text-sm font-mono text-green-400 leading-relaxed whitespace-pre-wrap break-words">
                 <code>{bodyContent}</code>
               </pre>
               <CopyButton text={bodyContent} />
             </div>
           </div>
        )}

      </div>
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-800/80 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-100 hover:bg-zinc-700"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
