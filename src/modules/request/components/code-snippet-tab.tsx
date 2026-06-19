import React, { useState } from 'react';
import { useRequestPlaygroundStore } from '@/modules/request/store/useRequestStore';
import { useWorkspaceStore } from '@/modules/layout/stores';
import { useEnvironments, useWorkspaceGlobals } from '@/modules/environments/hooks/environments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { 
    generateCurlSnippet, generateHttpSnippet, generateJsFetchSnippet, 
    generateJsXhrSnippet, generateNodeAxiosSnippet, generateNodeNativeSnippet, 
    generatePythonRequestsSnippet, generateJavaOkHttpSnippet, generateCSharpHttpClientSnippet, 
    generateGoNativeSnippet, generatePhpCurlSnippet, generateSwiftUrlSessionSnippet, 
    generateDartHttpSnippet, RequestDetails 
} from '@/modules/request/utils/snippet-generators';

const CodeSnippetTab = () => {
    const { activeTabId, tabs } = useRequestPlaygroundStore();
    const activeTab = tabs.find(t => t.id === activeTabId);
    
    const { selectedWorkspace, activeEnvironmentId } = useWorkspaceStore();
    const { data: environments } = useEnvironments(selectedWorkspace?.id);
    const { data: globals } = useWorkspaceGlobals(selectedWorkspace?.id);

    const [language, setLanguage] = useState('cURL');
    const [isCopied, setIsCopied] = useState(false);

    if (!activeTabId || !activeTab) {
        return (
            <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
                <p className="text-zinc-500">Open a request to view code snippets</p>
            </div>
        );
    }

    const activeEnv = environments?.find(e => e.id === activeEnvironmentId);

    const resolveVariable = (text: string) => {
        if (!text) return text;
        return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            const envValues = activeEnv?.values as any[];
            const envVar = Array.isArray(envValues) ? envValues.find((v: any) => v.key === trimmedKey) : null;
            if (envVar && envVar.currentValue) return envVar.currentValue;

            const globalValues = globals as any[];
            const globVar = Array.isArray(globalValues) ? globalValues.find((v: any) => v.key === trimmedKey) : null;
            if (globVar && globVar.currentValue) return globVar.currentValue;

            return match;
        });
    };

    const getRequestDetails = (): RequestDetails => {
        let headers: { key: string; value: string }[] = [];
        let params: { key: string; value: string }[] = [];
        let bodyContent = resolveVariable(activeTab.body || '');
        let resolvedUrl = resolveVariable(activeTab.url || '');

        try {
            if (activeTab.headers) {
                const parsedHeaders = JSON.parse(activeTab.headers);
                if (Array.isArray(parsedHeaders)) headers = parsedHeaders;
            }
            if (activeTab.parameters) {
                const parsedParams = JSON.parse(activeTab.parameters);
                if (Array.isArray(parsedParams)) params = parsedParams;
            }
        } catch (e) {
            // ignore
        }

        const validHeaders = headers
            .filter((h: any) => h.key && h.value)
            .map((h: any) => ({ key: resolveVariable(h.key), value: resolveVariable(h.value) }));

        const validParams = params.filter((p: any) => p.key && p.value);
        if (validParams.length > 0) {
            const queryString = validParams
                .map((p: any) => `${encodeURIComponent(resolveVariable(p.key))}=${encodeURIComponent(resolveVariable(p.value))}`)
                .join('&');
            
            resolvedUrl += resolvedUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
        }

        return {
            method: activeTab.method || 'GET',
            url: resolvedUrl,
            headers: validHeaders,
            body: bodyContent
        };
    };

    const generateSnippet = () => {
        const details = getRequestDetails();

        switch (language) {
            case 'cURL': return generateCurlSnippet(details);
            case 'HTTP': return generateHttpSnippet(details);
            case 'JavaScript - Fetch': return generateJsFetchSnippet(details);
            case 'JavaScript - XHR': return generateJsXhrSnippet(details);
            case 'NodeJs - Axios': return generateNodeAxiosSnippet(details);
            case 'NodeJs - Native': return generateNodeNativeSnippet(details);
            case 'Python - Requests': return generatePythonRequestsSnippet(details);
            case 'Java - OkHttp': return generateJavaOkHttpSnippet(details);
            case 'C# - HttpClient': return generateCSharpHttpClientSnippet(details);
            case 'Go - Native': return generateGoNativeSnippet(details);
            case 'PHP - cURL': return generatePhpCurlSnippet(details);
            case 'Swift - URLSession': return generateSwiftUrlSessionSnippet(details);
            case 'Dart - http': return generateDartHttpSnippet(details);
            default: return `// Generator for ${language} not found`;
        }
    };

    const snippet = generateSnippet();

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getEditorLanguage = () => {
        if (language.startsWith('JavaScript') || language.startsWith('NodeJs')) return 'javascript';
        if (language.startsWith('Python')) return 'python';
        if (language.startsWith('Java -')) return 'java';
        if (language.startsWith('C#')) return 'csharp';
        if (language.startsWith('Go')) return 'go';
        if (language.startsWith('PHP')) return 'php';
        if (language.startsWith('Swift')) return 'swift';
        if (language.startsWith('Dart')) return 'dart';
        if (language === 'HTTP') return 'http';
        return 'shell'; // default for cURL
    };

    return (
        <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Code snippet</span>
                </div>
                <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-zinc-300 cursor-pointer" />
                    <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-zinc-300 cursor-pointer" />
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800/50">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <SelectItem value="cURL">cURL</SelectItem>
                            <SelectItem value="HTTP">HTTP</SelectItem>
                            <SelectItem value="JavaScript - Fetch">JavaScript - Fetch</SelectItem>
                            <SelectItem value="JavaScript - XHR">JavaScript - XHR</SelectItem>
                            <SelectItem value="NodeJs - Axios">NodeJs - Axios</SelectItem>
                            <SelectItem value="NodeJs - Native">NodeJs - Native</SelectItem>
                            <SelectItem value="Python - Requests">Python - Requests</SelectItem>
                            <SelectItem value="Java - OkHttp">Java - OkHttp</SelectItem>
                            <SelectItem value="C# - HttpClient">C# - HttpClient</SelectItem>
                            <SelectItem value="Go - Native">Go - Native</SelectItem>
                            <SelectItem value="PHP - cURL">PHP - cURL</SelectItem>
                            <SelectItem value="Swift - URLSession">Swift - URLSession</SelectItem>
                            <SelectItem value="Dart - http">Dart - http</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleCopy}
                        className="text-zinc-400 hover:text-zinc-100 h-8 px-2"
                    >
                        {isCopied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                        {isCopied ? 'Copied' : 'Copy code'}
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <Editor
                        height="100%"
                        language={getEditorLanguage()}
                        theme="vs-dark"
                        value={snippet}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            padding: { top: 16 }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeSnippetTab;
