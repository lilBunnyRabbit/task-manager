import { useTheme } from "@/contexts/theme.context";
import { javascript } from "@codemirror/lang-javascript";
import { solarizedDark, solarizedLight } from "@uiw/codemirror-theme-solarized";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
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
