// src/components/HighlightingPlugin.tsx
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getRoot,
    $isElementNode,
    $isTextNode,
    $getNodeByKey, // <-- Import $getNodeByKey
    TextNode,
    LexicalEditor,
    NodeKey,
    $splitNode, // May need $splitNode or other transform utils later
    LexicalNode,
    ElementNode // Import if needed, maybe for queue type initially
} from 'lexical';
// Adjust path based on where you put HighlightNode.tsx
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
  // Ref to prevent applying highlights multiple times unnecessarily
  const appliedHighlightsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Guard clauses
    if (!editor || highlights.length === 0) {
      return;
    }

    // Use a small timeout to allow the editor state to settle after initial load or changes
    // This helps prevent issues if highlights are applied too early.
    const timeoutId = setTimeout(() => {
        applyHighlights(editor, highlights, appliedHighlightsRef);
    }, 100); // Adjust timeout duration as needed

    // Cleanup timeout on unmount or if dependencies change before timeout fires
    return () => clearTimeout(timeoutId);

  }, [editor, highlights]); // Depend on editor instance and highlights array


  // Function to apply highlights to the editor content
  const applyHighlights = (
      editor: LexicalEditor,
      highlightsToApply: Highlight[],
      appliedRef: React.MutableRefObject<Set<string>>
  ) => {
     console.log("HighlightingPlugin: Attempting to apply highlights", highlightsToApply);

     editor.update(() => {
        const root = $getRoot();
        if (!root) return;

        // --- Build Text Content and Node Map ---
        // Traverses the editor state to create a plain text representation
        // and map character indices back to the original TextNodes.
        let plainText = '';
        const nodePositions: NodePositionInfo[] = [];
        const nodeQueue: LexicalNode[] = [root]; // Use base LexicalNode type for queue
        let currentIndex = 0;

        while(nodeQueue.length > 0) {
            const node = nodeQueue.shift(); // Process nodes one by one

            if ($isTextNode(node)) {
                // If it's a TextNode, record its position and append its text
                const text = node.getTextContent();
                const start = currentIndex;
                const end = start + text.length;
                // Store info needed to find this node later
                nodePositions.push({ node, start, end, key: node.getKey() });
                plainText += text;
                currentIndex = end;
            } else if ($isElementNode(node)) {
                // If it's an ElementNode (like Paragraph, Heading), handle block separation
                 if (['paragraph', 'heading', 'listitem', 'quote'].includes(node.getType())) {
                     // Add a separator (double newline) between block elements for accurate text searching
                     if (currentIndex > 0 && !plainText.endsWith('\n\n')) { // Avoid adding at start or duplicate separators
                         plainText += '\n\n';
                         currentIndex += 2; // Account for separator length
                     }
                 }
                 // Add children to the front of the queue to maintain document order traversal
                 nodeQueue.unshift(...node.getChildren());
            } else if (node && node.getType() === 'linebreak') {
                 // Handle explicit line breaks within paragraphs
                 plainText += '\n';
                 currentIndex += 1;
            }
        }
        // Normalize whitespace in the final concatenated text
        plainText = plainText.replace(/\n{3,}/g, '\n\n').trim();
        console.log("HighlightingPlugin: Concatenated text for search (first 300 chars):", plainText.substring(0, 300) + "...");
        // --- End Text Building ---


        // --- Find and Apply Highlights ---
        let highlightAppliedInUpdate = false; // Flag to see if any changes were made

        highlightsToApply.forEach((hl, index) => {
            // Create a unique key for this specific highlight instance to avoid re-applying
            const highlightKey = `${index}-${hl.quote}`;
            if (!hl.quote || hl.quote.trim() === '' || appliedRef.current.has(highlightKey)) {
                 return; // Skip empty quotes or already applied highlights
            }

            const quote = hl.quote.trim();
            let searchStartIndex = 0;
            let foundIndex = -1;

            // Search for the quote within the concatenated plain text
            // TODO: This might need refinement for robustness (e.g., case-insensitivity? partial matches?)
            while ((foundIndex = plainText.indexOf(quote, searchStartIndex)) !== -1) {
                console.log(`HighlightingPlugin: Found quote [${quote}] at index ${foundIndex}`);
                const quoteEndIndex = foundIndex + quote.length;

                // --- Map quote indices back to Lexical nodes ---
                // Find all TextNodes that overlap with the found quote's character range
                const targetNodesInfo: { node: TextNode; startOffset: number; endOffset: number }[] = [];
                for (const posInfo of nodePositions) {
                    const overlapStart = Math.max(posInfo.start, foundIndex);
                    const overlapEnd = Math.min(posInfo.end, quoteEndIndex);

                    if (overlapStart < overlapEnd) { // If there is an overlap
                         const nodeTextLength = posInfo.node.getTextContent().length;
                         const localStartOffset = Math.max(0, overlapStart - posInfo.start);
                         const localEndOffset = Math.min(nodeTextLength, overlapEnd - posInfo.start);

                         if (localStartOffset < localEndOffset) {
                             targetNodesInfo.push({
                                 node: posInfo.node,
                                 startOffset: localStartOffset,
                                 endOffset: localEndOffset,
                             });
                         }
                    }
                }
                // --- End Node Mapping ---

                if (targetNodesInfo.length > 0) {
                    console.log(`HighlightingPlugin: Mapped quote [${quote}] to ${targetNodesInfo.length} node segment(s)`);
                    try {
                        // --- Apply Highlight using Node Transforms ---
                        // This section iterates through the identified node segments and replaces
                        // them with HighlightNode instances. It requires careful handling of node splitting.
                        let remainingQuoteText = quote; // Track quote text consumption

                        targetNodesInfo.forEach(({ node, startOffset, endOffset }) => {
                            // Get the latest version of the node from the current editor state
                            // *** USE $getNodeByKey HERE ***
                            const latestNode = $getNodeByKey(node.getKey());

                            // Ensure node still exists and is a TextNode
                            if (!$isTextNode(latestNode)) {
                                console.warn(`HighlightingPlugin: Node ${node.getKey()} is no longer a TextNode or was deleted.`);
                                return; // Skip this segment
                            }

                            const nodeTextSegment = latestNode.getTextContent().substring(startOffset, endOffset);
                            const segmentLength = nodeTextSegment.length;

                            // Basic check to see if the segment matches the start of the remaining quote
                            // NOTE: This check might be too simple if whitespace/normalization differs
                            if (remainingQuoteText.startsWith(nodeTextSegment)) {
                                remainingQuoteText = remainingQuoteText.substring(segmentLength); // Consume the matched part

                                const highlightNode = $createHighlightNode(
                                    nodeTextSegment, // Text for this specific highlight node
                                    hl.comment ?? '',
                                    hl.criterion ?? ''
                                );

                                // --- Node Splitting and Replacement Logic ---
                                // This is the most complex part. Needs robust testing.
                                if (startOffset === 0 && endOffset === latestNode.getTextContent().length) {
                                    // If the highlight covers the entire node, replace it directly
                                    latestNode.replace(highlightNode);
                                    console.log(`HighlightingPlugin: Replaced full node ${latestNode.getKey()} with highlight.`);
                                } else {
                                    // If the highlight covers only part of the node, split the node
                                    try {
                                        const targetNode = latestNode.splitText(startOffset, endOffset)[startOffset === 0 ? 0 : 1];
                                        if(targetNode){
                                            targetNode.replace(highlightNode);
                                            console.log(`HighlightingPlugin: Replaced split node ${targetNode.getKey()} with highlight.`);
                                        } else {
                                            console.error(`HighlightingPlugin: Failed to get target node after split for ${latestNode.getKey()}`);
                                        }
                                    } catch (splitError) {
                                         console.error(`HighlightingPlugin: Error splitting or replacing node ${latestNode.getKey()}:`, splitError);
                                         // Fallback or alternative strategy might be needed
                                    }
                                }
                                highlightAppliedInUpdate = true; // Mark that a change occurred
                                // --- End Node Splitting ---

                            } else {
                                console.warn(`HighlightingPlugin: Text segment mismatch. Quote: "${quote}", Remaining: "${remainingQuoteText}", Node Segment: "${nodeTextSegment}"`);
                                // This might happen due to normalization differences or incorrect mapping
                            }
                        }); // End loop through targetNodesInfo

                        // If we successfully applied the highlight (or part of it)
                        if (highlightAppliedInUpdate) {
                            appliedRef.current.add(highlightKey); // Mark as applied
                            break; // Exit while loop after handling the first found instance of the quote
                                   // Remove 'break' to highlight *all* occurrences if needed
                        }

                    } catch (e) {
                         console.error(`HighlightingPlugin: Error applying highlight node logic for quote [${quote}]:`, e);
                    }
                } else {
                    console.warn(`HighlightingPlugin: Could not map quote [${quote}] indices [${foundIndex}-${quoteEndIndex}] back to specific nodes.`);
                }

                // Prepare for the next iteration of the while loop (if finding all occurrences)
                searchStartIndex = foundIndex + 1;
                // Safety break
                 if (searchStartIndex >= plainText.length) break;

            } // End while loop (searching for quote instances)
        }); // End loop through highlightsToApply

        if (highlightAppliedInUpdate) {
            console.log("HighlightingPlugin: Finished applying highlights in this update cycle.");
        } else {
            console.log("HighlightingPlugin: No new highlights applied in this update cycle.");
        }

     }, { tag: 'highlighting' }); // Tag the update to potentially ignore own updates
  };

  // This plugin component doesn't render anything itself
  return null;
};

export default HighlightingPlugin;