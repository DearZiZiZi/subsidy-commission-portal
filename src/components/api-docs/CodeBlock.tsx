"use client";

import { Check, Clipboard } from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";

let registered: boolean | undefined;
function ensureHljs() {
  if (registered) return;
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("bash", bash);
  registered = true;
}

export function CodeBlock({
  code,
  language,
  label,
}: {
  code: string;
  language: string;
  label?: string;
}) {
  ensureHljs();
  const html = useMemo(() => {
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  }, [code, language]);

  const [copied, setCopied] = useState(false);
  const copyId = useId();

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lang = label ?? language.toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-lg border border-navy-600 bg-[#0d1117] text-left shadow-panel dark:shadow-panel-dark">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-gold-400"
          aria-labelledby={copyId}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-score-green" />
              <span id={copyId}>Скопировано!</span>
            </>
          ) : (
            <>
              <Clipboard className="h-3.5 w-3.5" />
              <span id={copyId}>Копировать</span>
            </>
          )}
        </button>
      </div>
      <pre className="hljs m-0 max-h-[min(480px,70vh)] overflow-auto p-4 font-mono text-[13px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
