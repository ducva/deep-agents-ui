
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import styles from "./MarkdownContent.module.scss";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent = React.memo<MarkdownContentProps>(
  ({ content, className = "" }) => {
    return (
      <div className={`${styles.markdown} ${className}`}>
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
                  className={styles.codeBlock}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={styles.inlineCode} {...props}>
                  {children}
                </code>
              );
            },
            pre({ children }: any) {
              return <div className={styles.preWrapper}>{children}</div>;
            },
            a({ href, children }: any) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {children}
                </a>
              );
            },
            blockquote({ children }: any) {
              return (
                <blockquote className={styles.blockquote}>
                  {children}
                </blockquote>
              );
            },
            ul({ children }: any) {
              return <ul className={styles.list}>{children}</ul>;
            },
            ol({ children }: any) {
              return <ol className={styles.orderedList}>{children}</ol>;
            },
            table({ children }: any) {
              return (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>{children}</table>
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
