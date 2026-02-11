"use client";

import * as React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

export interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className }: MathRendererProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Process the content to find and render math expressions
      const processedContent = renderMathInText(content);
      containerRef.current.innerHTML = processedContent;
    } catch (error) {
      console.error("Error rendering math:", error);
      // Fallback to plain text on error
      if (containerRef.current) {
        containerRef.current.textContent = content;
      }
    }
  }, [content]);

  return <div ref={containerRef} className={cn("math-content", className)} />;
}

function renderMathInText(text: string): string {
  // Replace display math ($$...$$)
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
    } catch (error) {
      console.error("Error rendering display math:", error);
      return match;
    }
  });

  // Replace inline math ($...$)
  result = result.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
    } catch (error) {
      console.error("Error rendering inline math:", error);
      return match;
    }
  });

  return result;
}
