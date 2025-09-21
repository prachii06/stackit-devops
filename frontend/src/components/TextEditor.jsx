import React, { useEffect, useRef, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Code from '@editorjs/code';

export default function TextEditor({ onSave, initialContent, className }) {
  const editorRef = useRef(null);
  const holderRef = useRef(null);
  const isInitialized = useRef(false);

  // Memoize the onChange handler to prevent re-initialization
  const handleChange = useCallback(async () => {
    if (!editorRef.current || !onSave) return;
    
    try {
      const savedData = await editorRef.current.save();
      // Convert to markdown-like format
      const content = savedData.blocks.map(block => {
        switch (block.type) {
          case 'paragraph':
            return block.data.text;
          case 'header':
            return `${('#').repeat(block.data.level)} ${block.data.text}`;
          case 'list':
            return block.data.items.map(item => `- ${item}`).join('\n');
          case 'code':
            return `\`\`\`\n${block.data.code}\n\`\`\``;
          default:
            return '';
        }
      }).join('\n\n').trim();
      
      onSave(content);
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  }, [onSave]);

  useEffect(() => {
    if (!holderRef.current || isInitialized.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      tools: {
        header: {
          class: Header,
          config: {
            levels: [2, 3],
            defaultLevel: 2
          }
        },
        list: {
          class: List,
          inlineToolbar: true
        },
        code: Code
      },
      placeholder: 'Write your question in detail... You can use headers, lists and code blocks',
      data: initialContent || {
        blocks: [{
          type: 'paragraph',
          data: { text: '' }
        }]
      },
      onChange: handleChange,
      autofocus: true,
      minHeight: 200
    });

    editorRef.current = editor;
    isInitialized.current = true;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
        isInitialized.current = false;
      }
    };
  }, []); // Remove onSave and initialContent from dependencies

  // Handle initial content separately
  useEffect(() => {
    if (editorRef.current && initialContent && !isInitialized.current) {
      editorRef.current.render(initialContent);
    }
  }, [initialContent]);

  return (
    <div className={`editor-js-container ${className || ''}`}>
      <style jsx="true">{`
        .editor-js-container {
          background: rgba(17, 24, 39, 0.7);
          border-radius: 0.75rem;
          transition: all 200ms;
        }
        
        .editor-js-container .codex-editor {
          color: #e2e8f0;
        }

        .editor-js-container .ce-block__content,
        .editor-js-container .ce-toolbar__content {
          max-width: 100%;
          margin: 0;
          padding: 0 1rem;
        }

        .editor-js-container .ce-paragraph {
          line-height: 1.6;
          font-size: 1rem;
        }

        .editor-js-container .ce-toolbar__actions {
          right: 1rem;
        }

        .editor-js-container .ce-toolbar__plus,
        .editor-js-container .ce-toolbar__settings-btn,
        .editor-js-container .cdx-button,
        .editor-js-container .ce-popover,
        .editor-js-container .ce-popover-item,
        .editor-js-container .ce-conversion-tool {
          color: #e2e8f0;
          background: rgba(31, 41, 55, 0.95);
          border: 1px solid rgba(75, 85, 99, 0.5);
          border-radius: 0.5rem;
        }

        .editor-js-container .ce-toolbar__plus:hover,
        .editor-js-container .ce-toolbar__settings-btn:hover,
        .editor-js-container .cdx-button:hover,
        .editor-js-container .ce-popover-item:hover,
        .editor-js-container .ce-conversion-tool:hover {
          background: rgba(55, 65, 81, 0.95);
          border-color: rgba(99, 102, 241, 0.6);
        }

        .editor-js-container .codex-editor--empty .ce-block:first-child .ce-paragraph[data-placeholder]:empty::before {
          color: #6b7280;
        }

        .editor-js-container .ce-toolbar__plus svg, 
        .editor-js-container .ce-toolbar__settings-btn svg {
          fill: currentColor;
        }

        .editor-js-container .cdx-block {
          padding: 0.5rem 0;
        }

        .editor-js-container .ce-toolbar {
          background: transparent;
        }

        .editor-js-container .codex-editor__redactor {
          padding-bottom: 80px !important;
        }

        .editor-js-container .ce-code__textarea {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(75, 85, 99, 0.5);
          border-radius: 0.5rem;
          color: #e2e8f0;
          font-family: 'Fira Code', monospace;
        }

        .editor-js-container .ce-header {
          padding: 0.5rem 0;
          margin: 0;
          font-weight: 600;
        }
      `}</style>
      <div ref={holderRef} className="prose prose-invert max-w-none" />
    </div>
  );
}