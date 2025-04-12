// src/components/RichTextEditor.tsx (Added onTextContentChange Prop)
"use client";

import React from 'react'; // Removed useEffect as it wasn't used directly here
import {
  $getRoot, // Need $getRoot
  $getSelection,
  EditorState,
  LexicalEditor,
  ParagraphNode,
  TextNode
} from 'lexical';

// Core Components & Plugins
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Node Imports for Rich Text Features
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";

// Custom Toolbar Plugin
import ToolbarPlugin from './ToolbarPlugin'; // Import the toolbar

// --- UPDATE Props Interface ---
interface RichTextEditorProps {
  initialState?: string;
  onChange: (stateJson: string) => void; // Existing prop for full state
  onTextContentChange?: (text: string) => void; // NEW: Prop for plain text content
}
// --- End Update ---

// Basic theme (Tailwind classes) - Copy your full theme here
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
};

// Define Nodes Used
const editorNodes = [
  ParagraphNode, TextNode, HeadingNode, QuoteNode,
  ListNode, ListItemNode, CodeHighlightNode, CodeNode,
  TableCellNode, TableNode, TableRowNode, AutoLinkNode, LinkNode
];

// Dummy Error Boundary
const DummyErrorBoundaryForProp: React.FC<{ onError: (error: Error) => void }> = () => null;

// --- The Editor Component ---
const RichTextEditor: React.FC<RichTextEditorProps> = ({
    initialState,
    onChange,
    onTextContentChange // <-- Destructure new prop
}) => {

  const initialConfig: InitialConfigType = {
    namespace: 'WritingSelectiveRichEditor',
    theme: editorTheme,
    onError(error: Error) {
      console.error('Lexical Composer Error:', error);
    },
    nodes: editorNodes,
    editorState: initialState,
  };

  // --- MODIFY the internal onChange handler ---
  const handleOnChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      // 1. Update full JSON state (existing logic)
      const jsonString = JSON.stringify(editorState.toJSON());
      onChange(jsonString);

      // 2. Get plain text and call new prop if provided (NEW)
      if (onTextContentChange) {
        const root = $getRoot();
        const text = root.getTextContent();
        onTextContentChange(text); // Pass plain text up
      }
    });
  };
  // --- End Modification ---

  const handleBoundaryError = (error: Error) => {
    console.error("LexicalErrorBoundary Caught Error:", error);
  };

  const Placeholder = () => (
      <div className="absolute top-[0.6rem] left-[0.6rem] text-gray-400 pointer-events-none overflow-hidden text-ellipsis whitespace-nowrap">
          Start writing your response here...
      </div>
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarPlugin />
      <div className="relative bg-white border border-gray-300 rounded-b">
        <RichTextPlugin
            contentEditable={
                <LexicalErrorBoundary onError={handleBoundaryError}>
                    <ContentEditable className={`min-h-[400px] p-2 outline-none resize-none text-gray-900`} />
                </LexicalErrorBoundary>
            }
            placeholder={<Placeholder />}
            ErrorBoundary={DummyErrorBoundaryForProp}
        />
        <HistoryPlugin />
        {/* Pass the MODIFIED handleOnChange here */}
        <OnChangePlugin onChange={handleOnChange} />
        <AutoFocusPlugin />
        <ListPlugin />
      </div>
    </LexicalComposer>
  );
};

export default RichTextEditor;