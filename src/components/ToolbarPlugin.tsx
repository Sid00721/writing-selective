// src/components/ToolbarPlugin.tsx (Enhanced with Lists)
"use client";

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState, useRef } from 'react'; // Added useRef
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  TextFormatType,
  $isRootOrShadowRoot, // Import for list check
  COMMAND_PRIORITY_CRITICAL, // Priorities for listeners
} from 'lexical';
import { $isLinkNode } from '@lexical/link';
// Import List specific functions and types
import {
    $isListNode,
    ListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $getNearestNodeOfType } from '@lexical/utils';

import React from 'react'; // Make sure React is imported

// Define props using an interface
interface ToolbarButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
}

// Define the component using React.FC and the Props interface
const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    label,
    onClick,
    isActive,
    disabled = false
}) => {
    return (
        <button
            type="button" // Good practice for buttons not submitting forms
            onClick={onClick}
            disabled={disabled}
            className={`px-2 py-1 mr-1 border rounded ${
                disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                isActive ? 'bg-blue-200 border-blue-400' : 'bg-white hover:bg-gray-100'
            }`}
            // Use title for accessibility if label is complex, keep aria-label for string labels
            title={typeof label === 'string' ? label : undefined}
            aria-label={typeof label === 'string' ? label : undefined}
        >
            {label}
        </button>
    );
};

// The rest of your ToolbarPlugin component code follows below this...
// export default function ToolbarPlugin() { ... }




export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null); // Ref for the toolbar element

  // State for toolbar buttons
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUL, setIsUL] = useState(false); // State for Unordered List
  const [isOL, setIsOL] = useState(false); // State for Ordered List
  // Add states for other formats if needed

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

       if (element === null) {
         element = anchorNode.getTopLevelElementOrThrow();
       }

       const elementDOM = editor.getElementByKey(element.getKey());

      // Update text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update list states
      const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
      const type = parentList ? parentList.getListType() : undefined;
      setIsUL(type === 'bullet');
      setIsOL(type === 'number');

      // Add checks for other block types (headings, links etc.) here later
    }
  }, [editor]); // Depend on editor

    // Effect to register listeners
    useEffect(() => {
        const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });

        // Need to explicitly listen to SELECTION_CHANGE_COMMAND for toolbar updates on click/selection
        const unregisterSelectionChange = editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            (_payload, newEditor) => {
              updateToolbar();
              return false; // Don't stop propagation
            },
            COMMAND_PRIORITY_CRITICAL
        );


        const unregisterCanUndo = editor.registerCommand(
            CAN_UNDO_COMMAND, (payload) => { setCanUndo(payload); return false; }, COMMAND_PRIORITY_CRITICAL
        );
        const unregisterCanRedo = editor.registerCommand(
            CAN_REDO_COMMAND, (payload) => { setCanRedo(payload); return false; }, COMMAND_PRIORITY_CRITICAL
        );

        return () => {
            unregisterUpdate();
            unregisterSelectionChange();
            unregisterCanUndo();
            unregisterCanRedo();
        };
    }, [editor, updateToolbar]);


  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  // Handlers for list buttons
  const formatBulletList = () => {
    if (!isUL) {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
     if (!isOL) {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  return (
    <div ref={toolbarRef} className="p-2 border-b border-gray-300 bg-gray-50 rounded-t">
        <ToolbarButton
            label="Undo" disabled={!canUndo} isActive={false}
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        />
         <ToolbarButton
            label="Redo" disabled={!canRedo} isActive={false}
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        />
         <span className="inline-block w-px h-5 bg-gray-300 mx-2 align-middle"></span>
        <ToolbarButton
            label={<span className='font-bold'>B</span>} isActive={isBold}
            onClick={() => formatText('bold')}
        />
         <ToolbarButton
            label={<span className='italic'>I</span>} isActive={isItalic}
            onClick={() => formatText('italic')}
        />
         <ToolbarButton
            label={<span className='underline'>U</span>} isActive={isUnderline}
            onClick={() => formatText('underline')}
        />
        <span className="inline-block w-px h-5 bg-gray-300 mx-2 align-middle"></span> {/* Divider */}
        {/* List Buttons */}
        <ToolbarButton
            label={<IconListBulleted />} // Using simple icon components (define below or import)
            isActive={isUL}
            onClick={formatBulletList}
        />
         <ToolbarButton
            label={<IconListNumbered />}
            isActive={isOL}
            onClick={formatNumberedList}
        />
       {/* Add more buttons (headings, quotes, links) here later */}
    </div>
  );
}


// Simple SVG Icons for buttons (replace with actual icons if preferred)
const IconListBulleted = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008h-.007V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008h-.007V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008h-.007v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const IconListNumbered = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008h-.007V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm0 5.25h.007v.008H3.75v-.008ZM5.625 6h.008v.008H5.625V6Zm0 5.25h.008v.008H5.625v-.008Zm0 5.25h.008v.008H5.625v-.008Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75H4.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H3.75v-.008H4.5a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75H3.75v-.008Zm0 5.25H4.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H3.75v-.008H4.5a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H3.75v.008Zm0 5.25H4.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H3.75v-.008H4.5a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H3.75v.008Z" /></svg>;

// Helper function (you might need to adjust this based on your exact node structure/needs)
function $findMatchingParent(
  startingNode: LexicalNode,
  findFn: (node: LexicalNode) => boolean
): LexicalNode | null {
  let node: LexicalNode | null = startingNode;
  while (node !== null && node.getKey() !== 'root') {
    if (findFn(node)) {
      return node;
    }
    node = node.getParent();
  }
  return null;
}

// You might also need to import LexicalNode type if not already implicitly available
import type { LexicalNode } from 'lexical';