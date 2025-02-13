import { useTheme } from "@/contexts/theme.context";
import { cn } from "@/lib/utils";
import { javascript } from "@codemirror/lang-javascript";
import { solarizedDark, solarizedLight } from "@uiw/codemirror-theme-solarized";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { CheckIcon, CopyIcon } from "lucide-react";
import React from "react";

export const CodeBlock: React.FC<Omit<ReactCodeMirrorProps, "theme" | "extensions">> = ({ ...props }) => {
  const { ifTheme } = useTheme();

  return (
    <CodeMirror
      theme={ifTheme(solarizedLight, solarizedDark)}
      extensions={[javascript({ typescript: true, jsx: true })]}
      className=""
      {...props}
    />
  );
};

interface CopyCodeBlockProps {
  code: string;
}

export const CopyCodeBlock: React.FC<CopyCodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-6 py-4 bg-foreground/10 rounded-lg border border-current font-mono w-fit relative group overflow-hidden">
      <pre className="overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className={cn(
          "absolute top-3 right-3 p-2 rounded-md bg-foreground/40 text-background opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground",
          copied && "hover:bg-success"
        )}
      >
        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      </button>
    </div>
  );
};
