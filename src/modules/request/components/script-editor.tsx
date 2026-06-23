import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent } from '@/components/ui/card';

interface ScriptEditorProps {
  initialData?: string;
  onSubmit: (script: string) => void;
  placeholder?: string;
}

const ScriptEditor = ({ initialData = '', onSubmit, placeholder }: ScriptEditorProps) => {
  const [script, setScript] = useState(initialData);

  useEffect(() => {
    setScript(initialData);
  }, [initialData]);

  const handleScriptChange = (value: string | undefined) => {
    const newVal = value || '';
    setScript(newVal);
    onSubmit(newVal);
  };

  return (
    <div className="w-full h-[350px] flex flex-col bg-[#0d0d0f] text-zinc-300">
      <div className="flex-1 min-h-0 relative border border-white/[0.06] rounded-none overflow-hidden bg-[#0d0d0f]">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={script}
          onChange={handleScriptChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            folding: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
              alwaysConsumeMouseWheel: false,
            },
            padding: { top: 16, bottom: 16 },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            suggest: { showWords: false },
            renderLineHighlight: 'all',
          }}
          theme="vs-dark"
        />
        {!script && placeholder && (
          <div className="absolute top-4 left-16 text-zinc-500 pointer-events-none select-none font-mono text-[13px] italic">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;
