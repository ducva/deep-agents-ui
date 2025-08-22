
import React, { useMemo, useCallback } from "react";
import { FileText, Copy, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownContent } from "../MarkdownContent/MarkdownContent";
import type { FileItem } from "../../types/types";

interface FileViewDialogProps {
  file: FileItem;
  onClose: () => void;
}

export const FileViewDialog = React.memo<FileViewDialogProps>(
  ({ file, onClose }) => {
    const fileExtension = useMemo(() => {
      return file.path.split(".").pop()?.toLowerCase() || "";
    }, [file.path]);

    const isMarkdown = useMemo(() => {
      return fileExtension === "md" || fileExtension === "markdown";
    }, [fileExtension]);

    const language = useMemo(() => {
      const languageMap: Record<string, string> = {
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        py: "python",
        rb: "ruby",
        go: "go",
        rs: "rust",
        java: "java",
        cpp: "cpp",
        c: "c",
        cs: "csharp",
        php: "php",
        swift: "swift",
        kt: "kotlin",
        scala: "scala",
        sh: "bash",
        bash: "bash",
        zsh: "bash",
        json: "json",
        xml: "xml",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "sass",
        less: "less",
        sql: "sql",
        yaml: "yaml",
        yml: "yaml",
        toml: "toml",
        ini: "ini",
        dockerfile: "dockerfile",
        makefile: "makefile",
      };
      return languageMap[fileExtension] || "text";
    }, [fileExtension]);

    const handleCopy = useCallback(() => {
      if (file.content) {
        navigator.clipboard.writeText(file.content);
      }
    }, [file.content]);

    const handleDownload = useCallback(() => {
      if (file.content) {
        const blob = new Blob([file.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.path;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, [file.content, file.path]);

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="!max-w-[80vw] !w-[900px] !max-h-[80vh] !flex !flex-col !bg-background !p-6">
          <DialogTitle className="sr-only">{file.path}</DialogTitle>
          <div className="flex justify-between items-center gap-4 pb-4 mb-4 border-b border-border">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-text-secondary flex-shrink-0" />
              <span className="text-base font-medium text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{file.path}</span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 mr-1 hover:bg-border-light"
              >
                <Copy size={16} />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 mr-1 hover:bg-border-light"
              >
                <Download size={16} />
                Download
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 max-h-[60vh] overflow-auto bg-surface rounded-md p-4 scrollbar-thin scrollbar-track-border-light scrollbar-thumb-text-tertiary hover:scrollbar-thumb-text-secondary">
            {file.content ? (
              isMarkdown ? (
                <div className="p-6 bg-background rounded-md">
                  <MarkdownContent content={file.content} />
                </div>
              ) : (
                <SyntaxHighlighter
                  language={language}
                  style={oneLight}
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                  showLineNumbers
                >
                  {file.content}
                </SyntaxHighlighter>
              )
            ) : (
              <div className="flex items-center justify-center p-12 text-text-tertiary">
                <p className="m-0 text-sm">File is empty</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  },
);

FileViewDialog.displayName = "FileViewDialog";
