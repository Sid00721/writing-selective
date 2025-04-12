// src/components/ReadOnlyLexical.tsx
"use client";

import React, { useEffect } from 'react';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'; // Use RichTextPlugin for rendering nodes
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'; // Named import

// Import ALL nodes that might be present in the saved content
import { ParagraphNode, TextNode } from 'lexical';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";

// Same theme used during editing for consistent display
const editorTheme = {
    // ... (Copy the *exact same* editorTheme object from RichTextEditor.tsx here) ...
    ltr: 'text-left', rtl: 'text-right', paragraph: 'mb-1',
    text: { bold: 'font-bold', italic: 'italic', /* etc */ },
    link: 'text-blue-600 underline', list: { /* ... */ }, heading: { /* ... */ }, quote: 'pl-4 border-l-4 border-gray-300 italic my-2',
};

const editorNodes = [
    // Include all nodes potentially used during writing
    ParagraphNode, TextNode, HeadingNode, QuoteNode, ListNode, ListItemNode,
    CodeHighlightNode, CodeNode, TableCellNode, TableNode, TableRowNode,
    AutoLinkNode, LinkNode
];

// Dummy Error Boundary for Prop requirement (if RichTextPlugin needs it)
const DummyErrorBoundaryForProp: React.FC<{ onError: (error: Error) => void }> = () => null;

// Props for the component
interface ReadOnlyLexicalProps {
  // Accept the parsed JSON object directly, or null/undefined
  initialJsonState: object | null | undefined;
}

const ReadOnlyLexical: React.FC<ReadOnlyLexicalProps> = ({ initialJsonState }) => {

  const initialConfig: InitialConfigType = {
    namespace: 'ReadOnlyViewer',
    nodes: editorNodes,
    theme: editorTheme,
    // CRITICAL: Set editable to false
    editable: false,
    editorState: initialJsonState ? JSON.stringify(initialJsonState) : undefined, // Pass JSON string
    onError(error: Error) {
      console.error('Read Only Lexical Error:', error);
    },
  };

  const handleBoundaryError = (error: Error) => {
    console.error("Read Only LexicalErrorBoundary Error:", error);
  };

  // Placeholder is simple text as ContentEditable won't be empty if state is valid
   const Placeholder = () => <div className='italic text-gray-900'>Loading content...</div>

  // Only render if initial state exists
  if (!initialJsonState) {
      return <p className="text-gray-900">No content available.</p>;
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* We don't need a surrounding div usually, let RichTextPlugin handle layout */}
      <RichTextPlugin
        contentEditable={
            <LexicalErrorBoundary onError={handleBoundaryError}>
                {/* Apply read-only specific styles if needed */}
                <ContentEditable className="outline-none text-gray-900" />
                {/* Note: ContentEditable className is less important here as it's not interactive */}
            </LexicalErrorBoundary>
        }
        placeholder={<Placeholder />} // Should only show if state is invalid/empty
        ErrorBoundary={DummyErrorBoundaryForProp} // Satisfy prop requirement
      />
      {/* No History, OnChange, AutoFocus needed for read-only */}
    </LexicalComposer>
  );
};

export default ReadOnlyLexical;