// src/components/RichTextEditor.tsx (Full Version with Toolbar & ListPlugin)
"use client";

import React, { useEffect } from 'react';
import {
  $getRoot,
  $getSelection,
  EditorState,
  LexicalEditor,
  ParagraphNode,
  TextNode
} from 'lexical';

// Core Components & Plugins
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'; // Use RichTextPlugin
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin'; // <-- Import ListPlugin
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'; // Named import

// Node Imports for Rich Text Features
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list"; // Ensure these are imported
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";

// Custom Toolbar Plugin
import ToolbarPlugin from './ToolbarPlugin'; // Import the toolbar

// Define Props
interface RichTextEditorProps {
  initialState?: string; // Accept initial state as JSON string (optional)
  onChange: (stateJson: string) => void; // Callback with updated state JSON string
}

// Basic theme (Tailwind classes) - Ensure this matches your actual theme needs
const editorTheme = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
  },
  link: 'text-blue-600 underline',
  list: {
      nested: {
          listitem: 'ml-8',
      },
      ol: 'list-decimal ml-4 pl-4',
      ul: 'list-disc ml-4 pl-4',
      listitem: 'mb-1',
  },
  heading: {
      h1: 'text-3xl font-bold mb-4',
      h2: 'text-2xl font-semibold mb-3',
      h3: 'text-xl font-semibold mb-2',
  },
  quote: 'pl-4 border-l-4 border-gray-300 italic my-2',
  // Add more styles as needed
};

// Define Nodes Used - Make sure all nodes needed for toolbar actions are here
const editorNodes = [
  ParagraphNode, TextNode, HeadingNode, QuoteNode,
  ListNode, ListItemNode, CodeHighlightNode, CodeNode,
  TableCellNode, TableNode, TableRowNode, AutoLinkNode, LinkNode
];

// Dummy Error Boundary for Prop requirement on RichTextPlugin
const DummyErrorBoundaryForProp: React.FC<{ onError: (error: Error) => void }> = () => null;

// --- The Editor Component ---
const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialState, onChange }) => {

  const initialConfig: InitialConfigType = {
    namespace: 'WritingSelectiveRichEditor',
    theme: editorTheme,
    onError(error: Error) {
      console.error('Lexical Composer Error:', error);
    },
    nodes: editorNodes,
    editorState: initialState, // Set initial state from prop
  };

  // Handler for OnChangePlugin
  const handleOnChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const jsonString = JSON.stringify(editorState.toJSON());
      onChange(jsonString); // Call parent's onChange with serialized state
    });
  };

  // Handler for the actual Error Boundary Wrapper
  const handleBoundaryError = (error: Error) => {
    console.error("LexicalErrorBoundary Caught Error:", error);
  };

  // Simple Placeholder Component
  const Placeholder = () => (
      <div className="absolute top-[0.6rem] left-[0.6rem] text-gray-400 pointer-events-none overflow-hidden text-ellipsis whitespace-nowrap">
          Start writing your response here...
      </div>
  );


  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* Toolbar goes inside Composer, usually above editor area */}
      <ToolbarPlugin />

      {/* Container for the editor plugins and contentEditable */}
      <div className="relative bg-white border border-gray-300 rounded-b"> {/* Rounded bottom */}

        <RichTextPlugin
            contentEditable={
                // Wrap ContentEditable with the actual Error Boundary
                <LexicalErrorBoundary onError={handleBoundaryError}>
                    <ContentEditable className={`min-h-[400px] p-2 outline-none resize-none`} />
                </LexicalErrorBoundary>
            }
            placeholder={<Placeholder />}
            // Pass the Dummy Component to satisfy the required prop type for RichTextPlugin
            ErrorBoundary={DummyErrorBoundaryForProp}
        />

        {/* Core & Supporting Plugins */}
        <HistoryPlugin />
        <OnChangePlugin onChange={handleOnChange} />
        <AutoFocusPlugin />
        <ListPlugin /> {/* <-- Added ListPlugin */}

        {/* Add other plugins like LinkPlugin etc. if needed later */}
        {/* e.g., <LinkPlugin /> */}

      </div>
    </LexicalComposer>
  );
};

export default RichTextEditor;