/**
 * AI 분석 결과 마크다운 텍스트 렌더링 컴포넌트 (공통)
 * Shared component that parses and renders AI analysis markdown text
 */

interface AnalysisContentProps {
  text: string;
  /** HTML 변환 함수 — 제공 시 dangerouslySetInnerHTML 사용 (XSS 이스케이프 필수) */
  /** HTML transform function — uses dangerouslySetInnerHTML when provided (must escape XSS) */
  highlightFn?: (text: string) => string;
}

export default function AnalysisContent({ text, highlightFn }: AnalysisContentProps) {
  const lines = text.split("\n");
  let lineKey = 0;

  // 텍스트를 렌더링 — highlightFn이 있으면 HTML로, 없으면 일반 텍스트로
  // Render text — as HTML with highlightFn, or as plain text without
  const renderText = (content: string) => {
    if (highlightFn) {
      return <span dangerouslySetInnerHTML={{ __html: highlightFn(content) }} />;
    }
    return <span>{content}</span>;
  };

  return (
    <div className="space-y-1.5 text-[13px] sm:text-[15px] leading-relaxed">
      {lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const k = `l-${lineKey++}`;

        // ## Heading
        if (trimmed.startsWith("## ")) {
          const headingText = trimmed.replace("## ", "");
          return (
            <h3
              key={k}
              className="text-base font-bold text-foreground pt-4 pb-1 first:pt-0 flex items-center gap-2"
            >
              {highlightFn ? (
                <span dangerouslySetInnerHTML={{ __html: highlightFn(headingText) }} />
              ) : (
                headingText
              )}
            </h3>
          );
        }

        // **bold** content
        if (trimmed.startsWith("**") && trimmed.includes("**:")) {
          const [label, ...rest] = trimmed.split("**:");
          const restText = rest.join("**:");
          return (
            <p key={k} className="text-muted-foreground pl-1">
              <span className="font-semibold text-foreground/80">
                {label.replace(/\*\*/g, "")}:
              </span>
              {renderText(restText)}
            </p>
          );
        }

        // - Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={k} className="flex gap-2 pl-1 text-muted-foreground">
              <span className="text-blue-400/60 mt-0.5 shrink-0">•</span>
              {renderText(trimmed.slice(2))}
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={k} className="flex gap-2 pl-1 text-muted-foreground">
              <span className="text-blue-400/60 mt-0.5 shrink-0 text-[13px] font-mono">
                {trimmed.match(/^\d+/)?.[0]}.
              </span>
              {renderText(trimmed.replace(/^\d+\.\s*/, ""))}
            </div>
          );
        }

        // 일반 텍스트 / Plain text
        return (
          <p key={k} className="text-muted-foreground">
            {highlightFn ? (
              <span dangerouslySetInnerHTML={{ __html: highlightFn(trimmed) }} />
            ) : (
              trimmed
            )}
          </p>
        );
      })}
    </div>
  );
}
