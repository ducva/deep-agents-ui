
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent = React.memo<MarkdownContentProps>(
  ({ content, className = "" }) => {
    return (
      <div className={`text-sm leading-relaxed break-words [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:font-semibold [&_h1]:first:mt-0 [&_h2]:mt-6 [&_h2]:mb-4 [&_h2]:font-semibold [&_h2]:first:mt-0 [&_h3]:mt-6 [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:first:mt-0 [&_h4]:mt-6 [&_h4]:mb-4 [&_h4]:font-semibold [&_h4]:first:mt-0 [&_h5]:mt-6 [&_h5]:mb-4 [&_h5]:font-semibold [&_h5]:first:mt-0 [&_h6]:mt-6 [&_h6]:mb-4 [&_h6]:font-semibold [&_h6]:first:mt-0 [&_p]:mb-4 [&_p]:last:mb-0 ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneLight as any}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md text-sm overflow-x-auto scrollbar-thin scrollbar-track-border-light scrollbar-thumb-text-tertiary hover:scrollbar-thumb-text-secondary"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="py-0.5 px-1 bg-surface rounded-sm font-mono text-[0.9em]" {...props}>
                  {children}
                </code>
              );
            },
            pre({ children }: any) {
              return <div className="my-4 last:mb-0">{children}</div>;
            },
            a({ href, children }: any) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary no-underline hover:underline"
                >
                  {children}
                </a>
              );
            },
            blockquote({ children }: any) {
              return (
                <blockquote className="my-4 pl-4 border-l-4 border-border text-text-secondary italic">
                  {children}
                </blockquote>
              );
            },
            ul({ children }: any) {
              return <ul className="my-4 pl-6 [&_li]:mb-1 [&_li]:last:mb-0">{children}</ul>;
            },
            ol({ children }: any) {
              return <ol className="my-4 pl-6 [&_li]:mb-1 [&_li]:last:mb-0">{children}</ol>;
            },
            table({ children }: any) {
              return (
                <div className="overflow-x-auto my-4">
                  <table className="w-full border-collapse [&_th]:bg-surface [&_th]:font-semibold [&_th]:text-left [&_th]:p-2 [&_th]:border [&_th]:border-border [&_td]:p-2 [&_td]:border [&_td]:border-border">{children}</table>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  },
);

MarkdownContent.displayName = "MarkdownContent";
