// src/components/HighlightingPlugin.tsx
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getRoot,
    $isElementNode,
    $isTextNode,
    $getNodeByKey,
    TextNode,
    LexicalEditor,
    NodeKey,
    $splitNode,
    LexicalNode,
    ElementNode
} from 'lexical';
// Adjust path if you placed HighlightNode.tsx elsewhere (e.g., directly in components)
import { $createHighlightNode, HighlightNode } from '@/components/HighlightNode';

// Interface for highlight data passed from props
interface Highlight {
  quote?: string;
  criterion?: string;
  comment?: string;
}

interface HighlightingPluginProps {
  highlights: Highlight[];
}

// Type for tracking text node positions
interface NodePositionInfo {
    node: TextNode;
    start: number; // Start index in the concatenated string
    end: number;   // End index in the concatenated string
    key: NodeKey;
}


const HighlightingPlugin: React.FC<HighlightingPluginProps> = ({ highlights }) => {
  const [editor] = useLexicalComposerContext();
  const appliedHighlightsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!editor || highlights.length === 0) {
      return;
    }
    const timeoutId = setTimeout(() => {
        applyHighlights(editor, highlights, appliedHighlightsRef);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [editor, highlights]);


  const applyHighlights = (
      editor: LexicalEditor,
      highlightsToApply: Highlight[],
      appliedRef: React.MutableRefObject<Set<string>>
  ) => {
     console.log("HighlightingPlugin: Attempting to apply highlights", highlightsToApply);

     editor.update(() => {
        const root = $getRoot();
        if (!root) return;

        let plainText = '';
        const nodePositions: NodePositionInfo[] = [];
        const nodeQueue: LexicalNode[] = [root];
        let currentIndex = 0;

        while(nodeQueue.length > 0) {
            const node = nodeQueue.shift();
            if ($isTextNode(node)) {
                const text = node.getTextContent();
                const start = currentIndex;
                const end = start + text.length;
                nodePositions.push({ node, start, end, key: node.getKey() });
                plainText += text;
                currentIndex = end;
            } else if ($isElementNode(node)) {
                 if (['paragraph', 'heading', 'listitem', 'quote'].includes(node.getType())) {
                     if (currentIndex > 0 && !plainText.endsWith('\n\n')) {
                         plainText += '\n\n';
                         currentIndex += 2;
                     }
                 }
                 nodeQueue.unshift(...node.getChildren());
            } else if (node && node.getType() === 'linebreak') {
                 plainText += '\n';
                 currentIndex += 1;
            }
        }
        plainText = plainText.replace(/\n{3,}/g, '\n\n').trim();
        console.log("HighlightingPlugin: Concatenated text for search (first 300 chars):", plainText.substring(0, 300) + "...");

        let highlightAppliedInUpdate = false;
        highlightsToApply.forEach((hl, index) => {
            const highlightKey = `${index}-${hl.quote}`;
            if (!hl.quote || hl.quote.trim() === '' || appliedRef.current.has(highlightKey)) {
                 return;
            }

            const quote = hl.quote.trim();
            let searchStartIndex = 0;
            let foundIndex = -1;

            while ((foundIndex = plainText.indexOf(quote, searchStartIndex)) !== -1) {
                console.log(`HighlightingPlugin: Found quote [${quote}] at index ${foundIndex}`);
                const quoteEndIndex = foundIndex + quote.length;
                const targetNodesInfo: { node: TextNode; startOffset: number; endOffset: number }[] = [];
                for (const posInfo of nodePositions) {
                    const overlapStart = Math.max(posInfo.start, foundIndex);
                    const overlapEnd = Math.min(posInfo.end, quoteEndIndex);
                    if (overlapStart < overlapEnd) {
                         const nodeTextLength = posInfo.node.getTextContent().length;
                         const localStartOffset = Math.max(0, overlapStart - posInfo.start);
                         const localEndOffset = Math.min(nodeTextLength, overlapEnd - posInfo.start);
                         if (localStartOffset < localEndOffset) {
                             targetNodesInfo.push({ node: posInfo.node, startOffset: localStartOffset, endOffset: localEndOffset });
                         }
                    }
                }

                if (targetNodesInfo.length > 0) {
                    console.log(`HighlightingPlugin: Mapped quote [${quote}] to ${targetNodesInfo.length} node segment(s)`);
                    try {
                        let remainingQuoteText = quote;
                        targetNodesInfo.forEach(({ node, startOffset, endOffset }) => {
                            const latestNode = $getNodeByKey(node.getKey());
                            if (!$isTextNode(latestNode)) {
                                console.warn(`HighlightingPlugin: Node ${node.getKey()} is no longer a TextNode or was deleted.`);
                                return;
                            }
                            const nodeTextSegment = latestNode.getTextContent().substring(startOffset, endOffset);
                            const segmentLength = nodeTextSegment.length;

                            if (remainingQuoteText.startsWith(nodeTextSegment)) { // Basic check
                                remainingQuoteText = remainingQuoteText.substring(segmentLength);
                                console.log("HighlightingPlugin: Creating HighlightNode with clean text:", nodeTextSegment, "Clean Comment:", hl.comment ?? '', "Clean Criterion:", hl.criterion ?? '');
                                const highlightNode = $createHighlightNode(
                                    nodeTextSegment,
                                    hl.comment ?? '',
                                    hl.criterion ?? ''
                                );

                                if (startOffset === 0 && endOffset === latestNode.getTextContent().length) {
                                    latestNode.replace(highlightNode);
                                    console.log(`HighlightingPlugin: Replaced full node ${latestNode.getKey()} with highlight.`);
                                } else {
                                    try {
                                        const targetNodeForHighlight = latestNode.splitText(startOffset, endOffset)[startOffset === 0 ? 0 : 1];
                                        if(targetNodeForHighlight){
                                            targetNodeForHighlight.replace(highlightNode);
                                            console.log(`HighlightingPlugin: Replaced split node ${targetNodeForHighlight.getKey()} with highlight.`);
                                        } else {
                                             console.error(`HighlightingPlugin: Failed to get target node after split for ${latestNode.getKey()}`);
                                        }
                                    } catch (splitError) {
                                         console.error(`HighlightingPlugin: Error splitting or replacing node ${latestNode.getKey()}:`, splitError);
                                    }
                                }
                                highlightAppliedInUpdate = true;
                            } else {
                                console.warn(`HighlightingPlugin: Text segment mismatch. Quote: "${quote}", Remaining: "${remainingQuoteText}", Node Segment: "${nodeTextSegment}"`);
                            }
                        });

                        if (highlightAppliedInUpdate) {
                            appliedRef.current.add(highlightKey);
                            break;
                        }
                    } catch (e) {
                         console.error(`HighlightingPlugin: Error applying highlight node logic for quote [${quote}]:`, e);
                    }
                } else {
                    console.warn(`HighlightingPlugin: Could not map quote [${quote}] indices [${foundIndex}-${quoteEndIndex}] back to specific nodes.`);
                }
                searchStartIndex = foundIndex + 1;
                 if (searchStartIndex >= plainText.length) break;
            }
        });

        if (highlightAppliedInUpdate) {
            console.log("HighlightingPlugin: Finished applying highlights in this update cycle.");
        } else {
            console.log("HighlightingPlugin: No new highlights applied in this update cycle.");
        }
     }, { tag: 'highlighting' });
  };
  return null;
};
export default HighlightingPlugin;