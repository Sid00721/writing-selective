// src/components/ReadOnlyLexical.tsx
"use client";

import React from 'react';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { ParagraphNode, TextNode, LineBreakNode } from 'lexical';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
// Adjust path if you placed HighlightNode.tsx elsewhere
import { HighlightNode } from './HighlightNode';
import HighlightingPlugin from './HighlightingPlugin';

interface Highlight {
  quote?: string;
  criterion?: string;
  comment?: string;
}

interface ReadOnlyLexicalProps {
  initialJsonState: object | null | undefined;
  highlights?: Highlight[] | null;
}

// TODO: COPY YOUR ACTUAL EDITOR THEME HERE
const editorTheme = {
  ltr: 'text-left', rtl: 'text-right', paragraph: 'mb-1 text-gray-800 dark:text-gray-200',
  text: { bold: 'font-bold', italic: 'italic', underline: 'underline', strikethrough: 'line-through', code: 'bg-gray-100 text-sm font-mono px-1' },
  link: 'text-blue-600 underline', heading: {h1: 'text-2xl font-bold', h2: 'text-xl font-bold', h3: 'text-lg font-bold'},
  list: { ol: 'list-decimal ml-6', ul: 'list-disc ml-6', listitem: 'mb-1' },
  quote: 'pl-4 border-l-4 border-gray-300 italic',
  code: 'block bg-gray-100 text-sm font-mono p-2 rounded'
};

const editorNodes = [
    ParagraphNode, TextNode, LineBreakNode, HeadingNode, QuoteNode, ListNode, ListItemNode,
    CodeHighlightNode, CodeNode, TableCellNode, TableNode, TableRowNode,
    AutoLinkNode, LinkNode, HighlightNode // Ensure HighlightNode is registered
];

const DummyErrorBoundaryForProp: React.FC<{ onError: (error: Error) => void }> = () => null;

const ReadOnlyLexical: React.FC<ReadOnlyLexicalProps> = ({
    initialJsonState,
    highlights
}) => {
    if (initialJsonState) {
        console.log("ReadOnlyLexical: Received initialJsonState prop.");
        console.log("ReadOnlyLexical: initialJsonState sample (root check):",
            JSON.stringify(initialJsonState)?.includes('"root":{') ? "Contains root object" : "DOES NOT contain root object structure",
            JSON.stringify(initialJsonState)?.substring(0, 300)
        );
    } else {
        console.warn("ReadOnlyLexical: Received initialJsonState prop as null or undefined.");
    }

    const initialConfig: InitialConfigType = {
        namespace: 'ReadOnlyViewer',
        nodes: editorNodes,
        theme: editorTheme,
        editable: false,
        editorState: initialJsonState
            ? (typeof initialJsonState === 'string' ? initialJsonState : JSON.stringify(initialJsonState))
            : undefined,
        onError(error: Error) {
            console.error('ReadOnlyLexical Composer Error:', error);
        },
    };

    const handleBoundaryError = (error: Error) => {
        console.error("ReadOnlyLexical ErrorBoundary Error:", error);
    };

    const Placeholder = () => <div className='italic text-gray-500'>Loading content...</div>;

    if (!initialJsonState) {
        return <p className="text-gray-500 italic">No submission content found to display.</p>;
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <RichTextPlugin
                contentEditable={
                    <LexicalErrorBoundary onError={handleBoundaryError}>
                        <ContentEditable className="outline-none content-readonly" />
                    </LexicalErrorBoundary>
                }
                placeholder={<Placeholder />}
                ErrorBoundary={DummyErrorBoundaryForProp}
            />
            <HighlightingPlugin highlights={highlights ?? []} />
        </LexicalComposer>
    );
};

export default ReadOnlyLexical;