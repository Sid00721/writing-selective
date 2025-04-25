// src/nodes/HighlightNode.tsx
import React, { useState } from 'react';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';

// Define the data stored in the serialized node
export type SerializedHighlightNode = Spread<
  {
    text: string;
    comment: string;
    criterion: string;
  },
  SerializedLexicalNode
>;

// --- Helper function for DOM conversion ---
function convertSpanElement(domNode: HTMLElement): DOMConversionOutput | null {
  const text = domNode.innerText;
  // Retrieve data attributes set during export
  const comment = domNode.dataset.comment || '';
  const criterion = domNode.dataset.criterion || '';
  if (text) {
    // Create a HighlightNode with the retrieved data
    const node = $createHighlightNode(text, comment, criterion);
    return { node };
  }
  return null;
}

// --- React Component for the Decorator ---
function HighlightComponent({
    nodeKey,
    text,
    comment,
    criterion,
}: {
    nodeKey: NodeKey;
    text: string;
    comment: string;
    criterion: string;
}) {
    const [showComment, setShowComment] = useState(false);
    // Define styles using Tailwind classes
    const bgColor = 'bg-yellow-200'; // Or dynamic based on criterion?
    const borderColor = 'border-yellow-400';

    return (
        <span
            className={`relative ${bgColor} px-1 rounded border ${borderColor} cursor-pointer transition-opacity duration-150 ease-in-out`}
            data-lexical-highlight="true"
            onMouseEnter={() => setShowComment(true)}
            onMouseLeave={() => setShowComment(false)}
            onClick={(e) => { e.stopPropagation(); setShowComment(!showComment); }} // Prevent click propagating further if needed
        >
            {text}
            {/* Basic Tooltip */}
            {showComment && comment && (
                <span
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-1.5 px-3 z-50 shadow-lg"
                    style={{ pointerEvents: 'none' }} // Prevent tooltip interaction issues
                >
                     {comment}
                     {criterion && <span className="block text-gray-400 text-[10px] mt-1 font-medium uppercase tracking-wider">({criterion.replace(/_/g, ' ')})</span>}
                </span>
            )}
        </span>
    );
}


// --- Highlight Node Definition ---
export class HighlightNode extends DecoratorNode<React.ReactNode> {
  // Properties to store the node's data
  __text: string;
  __comment: string;
  __criterion: string;

  static getType(): string {
    return 'highlight'; // Unique type identifier
  }

  static clone(node: HighlightNode): HighlightNode {
    return new HighlightNode(node.__text, node.__comment, node.__criterion, node.__key);
  }

  // Allows creating this node from a JSON representation (e.g., loading state)
  static importJSON(serializedNode: SerializedHighlightNode): HighlightNode {
    return $createHighlightNode(
        serializedNode.text,
        serializedNode.comment,
        serializedNode.criterion
    );
  }

  constructor(text: string, comment: string, criterion: string, key?: NodeKey) {
    super(key);
    this.__text = text;
    this.__comment = comment;
    this.__criterion = criterion;
  }

  // Converts the node instance to a JSON representation
  exportJSON(): SerializedHighlightNode {
    return {
      type: 'highlight',
      version: 1,
      text: this.__text,
      comment: this.__comment,
      criterion: this.__criterion,
    };
  }

  // Defines how to convert from specific DOM elements back into this node type
  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        // Only convert spans that have our specific data attribute
        if (!domNode.hasAttribute('data-lexical-highlight')) {
          return null;
        }
        return {
          conversion: convertSpanElement,
          priority: 1, // High priority to override generic span conversion
        };
      },
    };
  }

  // Defines how to convert this node instance into a DOM element
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor); // Get the default span
    if (element && element instanceof HTMLElement) {
        element.setAttribute('data-lexical-highlight', 'true');
        element.setAttribute('data-comment', this.__comment);
        element.setAttribute('data-criterion', this.__criterion);
        element.style.backgroundColor = 'yellow'; // Example basic styling for copy/paste
        element.innerText = this.__text; // Set the text content
    }
    return { element };
  }

  // Creates the base DOM element for this node (React component replaces content)
  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    // Apply theme classes or styles if the React component isn't used for rendering
    // const theme = config.theme;
    // if (theme.highlight) { span.className = theme.highlight; }
    return span;
  }

  // Indicates that the DOM element should not be updated directly by Lexical
  updateDOM(): boolean {
    return false;
  }

  // Returns the plain text content of the node
  getTextContent(): string {
    return this.__text;
  }

  // Renders the React component for this node
  decorate(): React.ReactNode {
    return (
      <HighlightComponent
        nodeKey={this.__key}
        text={this.__text}
        comment={this.__comment}
        criterion={this.__criterion}
      />
    );
  }
}

// --- Factory Function ---
// Helper function to easily create instances of HighlightNode
export function $createHighlightNode(text: string, comment: string, criterion: string): HighlightNode {
  // Using apply ensures the node is registered if called outside an update cycle
  return new HighlightNode(text, comment, criterion);
}

// --- Type Guard Function ---
// Helper function to check if a LexicalNode is a HighlightNode
export function $isHighlightNode(node: LexicalNode | null | undefined): node is HighlightNode {
  return node instanceof HighlightNode;
}