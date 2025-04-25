// src/components/ReadOnlyLexical.tsx
"use client";

import React from 'react';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Import ALL nodes that might be present in the saved content
import { ParagraphNode, TextNode, LineBreakNode } from 'lexical'; // Added LineBreakNode
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
// **** NEW: Import custom HighlightNode ****
import { HighlightNode } from './HighlightNode'; // Adjust path if needed
// **** NEW: Import Highlighting Plugin ****
import HighlightingPlugin from './HighlightingPlugin'; // Adjust path if needed

// Define structure for feedback highlights
interface Highlight {
  quote?: string;
  criterion?: string;
  comment?: string;
}

// Props for the component
interface ReadOnlyLexicalProps {
  initialJsonState: object | null | undefined;
  highlights?: Highlight[] | null; // Accept highlights
}

// TODO: Define or import your actual editor theme here for consistent styling
const editorTheme = {
  // Example basic theme (COPY YOUR ACTUAL THEME HERE)
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-1', // Reduced margin for read-only?
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono',
  },
  link: 'text-blue-600 underline cursor-default', // Non-interactive link style
  list: {
      nested: { listitem: 'ml-4' },
      ol: 'list-decimal list-inside mb-2',
      ul: 'list-disc list-inside mb-2',
      listitem: 'mb-1 leading-tight',
  },
  heading: {
      h1: 'text-3xl font-bold my-4',
      h2: 'text-2xl font-semibold my-3',
      h3: 'text-xl font-semibold my-2',
  },
  quote: 'pl-4 border-l-4 border-gray-300 italic my-2 text-gray-700',
  code: 'block bg-gray-100 text-black font-mono text-sm p-4 my-2 overflow-x-auto rounded',
  // Placeholder class for highlight node if needed (styling done by component)
  // highlight: 'bg-yellow-200',
};

// Include all standard nodes PLUS our custom HighlightNode
const editorNodes = [
    ParagraphNode, TextNode, LineBreakNode, HeadingNode, QuoteNode, ListNode, ListItemNode,
    CodeHighlightNode, CodeNode, TableCellNode, TableNode, TableRowNode,
    AutoLinkNode, LinkNode,
    HighlightNode // **** REGISTER HighlightNode ****
];

// Satisfy ErrorBoundary prop type if RichTextPlugin requires it
const DummyErrorBoundaryForProp: React.FC<{ onError: (error: Error) => void }> = () => null;


const ReadOnlyLexical: React.FC<ReadOnlyLexicalProps> = ({
    initialJsonState,
    highlights // Destructure highlights prop
}) => {

    const initialConfig: InitialConfigType = {
        namespace: 'ReadOnlyViewer',
        nodes: editorNodes, // Include HighlightNode here
        theme: editorTheme,
        editable: false, // Ensure editor is not editable
        // Handle initial state: null/undefined or stringified JSON
        editorState: initialJsonState
            ? (typeof initialJsonState === 'string' ? initialJsonState : JSON.stringify(initialJsonState))
            : undefined,
        onError(error: Error) {
            console.error('Read Only Lexical Composer Error:', error);
        },
    };

    const handleBoundaryError = (error: Error) => {
        console.error("Read Only LexicalErrorBoundary Error:", error);
        // Potentially render an error message within the boundary
    };

    // Basic placeholder text
    const Placeholder = () => <div className='italic text-gray-500'>Loading content...</div>;

    // Render nothing or a specific message if no initial state is provided
    if (!initialJsonState) {
        return <p className="text-gray-500 italic">No content available.</p>;
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <RichTextPlugin
                contentEditable={
                    <LexicalErrorBoundary onError={handleBoundaryError}>
                        {/* Read-only content area */}
                        <ContentEditable className="outline-none content-readonly" />
                    </LexicalErrorBoundary>
                }
                placeholder={<Placeholder />} // Displayed if editor state becomes empty/invalid
                ErrorBoundary={DummyErrorBoundaryForProp} // Prop needed by RichTextPlugin
            />
            {/* **** ADD the Highlighting Plugin and pass highlights **** */}
            <HighlightingPlugin highlights={highlights ?? []} />
        </LexicalComposer>
    );
};

export default ReadOnlyLexical;