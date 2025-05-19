// src/components/HighlightNode.tsx
import React from 'react'; // Removed useState, not needed in simplified version
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
  const comment = domNode.dataset.comment || '';
  const criterion = domNode.dataset.criterion || '';
  if (text) {
    const node = $createHighlightNode(text, comment, criterion);
    return { node };
  }
  return null;
}

// --- React Component for the Decorator (SIMPLIFIED FOR TESTING) ---
function HighlightComponent({
    text,
}: {
    text: string;
}) {
    // This console.log is CRITICAL for this test
    console.log(`HighlightComponent: Rendering simplified span for text - "${text}"`);
    return (
        <span style={{
            backgroundColor: 'magenta', // Very obvious color
            border: '3px solid limegreen',   // Very obvious border
            color: 'black', // Ensure text is visible
            padding: '2px', // Add some padding
            margin: '0 2px', // Add some margin to separate if multiple are inline
            display: 'inline', // Ensure it's not block or anything weird
            fontSize: 'inherit', // Inherit font size
            fontWeight: 'inherit' // Inherit font weight
        }}>
            {text}
        </span>
    );
}


// --- Highlight Node Definition ---
export class HighlightNode extends DecoratorNode<React.ReactNode> {
  __text: string;
  __comment: string;
  __criterion: string;

  static getType(): string {
    return 'highlight';
  }

  static clone(node: HighlightNode): HighlightNode {
    return new HighlightNode(node.__text, node.__comment, node.__criterion, node.__key);
  }

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

  exportJSON(): SerializedHighlightNode {
    return {
      type: 'highlight',
      version: 1,
      text: this.__text,
      comment: this.__comment,
      criterion: this.__criterion,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-highlight')) {
          return null;
        }
        return {
          conversion: convertSpanElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    if (element && element instanceof HTMLElement) {
        element.setAttribute('data-lexical-highlight', 'true');
        element.setAttribute('data-comment', this.__comment);
        element.setAttribute('data-criterion', this.__criterion);
        element.innerText = this.__text;
    }
    return { element };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    // Add attributes for easier DOM querying during debug, and for Lexical
    span.setAttribute('data-lexical-decorator-placeholder', 'true');
    span.setAttribute('data-lexical-node-key', this.getKey());
    span.setAttribute('data-highlight-text', this.__text.substring(0, 20));
    console.log(`HighlightNode: createDOM called for text - "${this.__text.substring(0,20)}" with key ${this.getKey()}`);
    return span;
  }

  updateDOM(): boolean {
    return false; // Correct for React-rendered decorators
  }

  getTextContent(): string {
    return this.__text;
  }

  // *** DECORATE METHOD - setTimeout HACK REMOVED ***
  decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
    console.log(`HighlightNode (decorate): Decorating node (key: ${this.getKey()}) with text - "${this.__text}"`);
    const componentToRender = ( <HighlightComponent text={this.__text} /> );
    console.log("HighlightNode (decorate): componentToRender is:", componentToRender);
    return componentToRender; // Just return the React component
  }
}
// --- END Highlight Node Definition ---

// --- Factory Function ---
export function $createHighlightNode(text: string, comment: string, criterion: string): HighlightNode {
  return new HighlightNode(text, comment, criterion);
}

// --- Type Guard Function ---
export function $isHighlightNode(node: LexicalNode | null | undefined): node is HighlightNode {
  return node instanceof HighlightNode;
}