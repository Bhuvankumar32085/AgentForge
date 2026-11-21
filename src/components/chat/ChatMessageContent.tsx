import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, ExternalLink, Terminal } from "lucide-react";

interface ChatMessageContentProps {
  content: string;
  isAgent?: boolean;
}

interface CodeBlockProps {
  language?: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy code:", err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-purple-500/25 bg-[#0b0518] shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#150830] border-b border-purple-500/20 text-[11px] text-purple-300">
        <div className="flex items-center gap-1.5 font-mono">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span className="uppercase tracking-wider font-semibold">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-purple-600/30 text-purple-200 transition-colors text-[11px] cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-purple-300" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono text-purple-100/90 leading-relaxed">
        <pre className="!m-0 !p-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({
  content,
  isAgent = true,
}) => {
  if (!isAgent) {
    // For user messages: clean text display with whitespace preserved
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  return (
    <div className="chat-markdown-content text-xs sm:text-sm text-slate-100/95 leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold mt-3.5 mb-2 first:mt-0 flex items-center gap-2 border-b border-purple-500/20 pb-1.5 bg-gradient-to-r from-purple-200 via-indigo-200 to-white bg-clip-text text-transparent">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-white mt-3 mb-1.5 first:mt-0 flex items-center gap-2 text-purple-100">
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-purple-400 to-indigo-500 inline-block shrink-0" />
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-purple-200 mt-2.5 mb-1 first:mt-0 tracking-wide flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-100/90">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-400/25 text-purple-100 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-purple-200 italic font-medium">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1.5 my-2.5 marker:text-purple-400 marker:font-bold">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1.5 my-2.5 marker:text-purple-300 marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5 text-slate-100/90">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-purple-400/80 bg-purple-950/30 px-3.5 py-2 my-2.5 rounded-r-lg text-purple-200/90 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-purple-500/20" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 underline underline-offset-2 inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3 inline shrink-0 opacity-80" />
            </a>
          ),
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isMultiLine =
              Boolean(match) || (typeof children === "string" && children.includes("\n"));

            if (isMultiLine) {
              return (
                <CodeBlock
                  language={match ? match[1] : undefined}
                  code={codeString}
                />
              );
            }

            return (
              <code
                className="font-mono text-[11px] sm:text-xs bg-purple-950/70 border border-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded shadow-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-purple-500/25 bg-[#0d061e] shadow-md">
              <table className="min-w-full text-left text-xs divide-y divide-purple-500/20">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tbody: ({ children }) => (
            <tbody className="divide-y divide-purple-500/10">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-purple-900/15 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="bg-purple-950/60 px-3.5 py-2 font-semibold text-purple-200 uppercase tracking-wider text-[11px]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-slate-200">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
export default ChatMessageContent;

