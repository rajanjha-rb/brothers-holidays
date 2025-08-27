"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough,
  FaListUl, 
  FaListOl, 
  FaQuoteLeft, 
  FaCode, 
  FaLink,
  FaMinus,
  FaHeading,
  FaTable,
  FaImage,
  FaCheckSquare,
  FaEye,
  FaEdit,
  FaQuestionCircle
} from "react-icons/fa";

interface RTEPROPS {
  value?: string;
  onChange?: (value?: string) => void;
  height?: number;
  placeholder?: string;
}

// Modern RTE implementation without deprecated execCommand
// Function to convert content to HTML for preview
const convertToHTML = (content: string): string => {
  if (!content) return '';
  
  // Normalize line endings
  const cleanContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  
  const lines = cleanContent.split('\n');
  let html = '';
  let inList = false;
  let listType = '';
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      html += '<br>';
      continue;
    }
    
    // Headings
    if (line.startsWith('# ')) {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      const headingText = line.substring(2).trim();
      html += `<h1 style="font-size: 2em; font-weight: bold; margin: 16px 0; color: #1f2937;">${headingText}</h1>`;
      continue;
    }
    
    if (line.startsWith('## ')) {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      const headingText = line.substring(3).trim();
      html += `<h2 style="font-size: 1.5em; font-weight: bold; margin: 16px 0; color: #1f2937;">${headingText}</h2>`;
      continue;
    }
    
    if (line.startsWith('### ')) {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      const headingText = line.substring(4).trim();
      html += `<h3 style="font-size: 1.25em; font-weight: bold; margin: 16px 0; color: #1f2937;">${headingText}</h3>`;
      continue;
    }
    
    // Horizontal rules
    if (line === '---' || line === '***') {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      html += '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">';
      continue;
    }
    
    // Blockquotes
    if (line.startsWith('> ')) {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      const quoteText = line.substring(2).trim();
      html += `<blockquote style="border-left: 4px solid #e5e7eb; margin: 16px 0; padding-left: 16px; color: #6b7280; font-style: italic;">${quoteText}</blockquote>`;
      continue;
    }
    
    // Unordered lists
    if (line.match(/^[\*\-+] (.+)$/)) {
      if (!inList || listType !== 'ul') {
        if (inList && listItems.length > 0) {
          html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
          listItems = [];
        }
        inList = true;
        listType = 'ul';
      }
      const listText = line.replace(/^[\*\-+] (.+)$/, '$1');
      listItems.push(`<li style="margin: 8px 0;">${listText}</li>`);
      continue;
    }
    
    // Ordered lists
    if (line.match(/^\d+\. (.+)$/)) {
      if (!inList || listType !== 'ol') {
        if (inList && listItems.length > 0) {
          html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
          listItems = [];
        }
        inList = true;
        listType = 'ol';
      }
      const listText = line.replace(/^\d+\. (.+)$/, '$1');
      listItems.push(`<li style="margin: 8px 0;">${listText}</li>`);
      continue;
    }
    
    // Process inline formatting
    let formattedLine = line;
    
    // Bold
    formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>');
    formattedLine = formattedLine.replace(/__(.*?)__/g, '<strong style="font-weight: bold;">$1</strong>');
    
    // Italic
    formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    formattedLine = formattedLine.replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>');
    
    // Strikethrough
    formattedLine = formattedLine.replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through;">$1</del>');
    
    // Inline code
    formattedLine = formattedLine.replace(/`(.*?)`/g, '<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');
    
    // Links
    formattedLine = formattedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>');
    
    // Images
    formattedLine = formattedLine.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px;">');
    
    // Regular text
    if (inList && listItems.length > 0) {
      html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
      listItems = [];
      inList = false;
    }
    
    html += `<p style="margin: 8px 0; line-height: 1.6;">${formattedLine}</p>`;
  }
  
  // Close any remaining open lists
  if (inList && listItems.length > 0) {
    html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
  }
  
  return html;
};

const EnhancedRTE = ({ value, onChange, height = 400, placeholder }: RTEPROPS) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [rawTextValue, setRawTextValue] = useState('');

  // Modern way to apply formatting using Selection API
  const applyFormatting = (tagName: string, style?: Partial<CSSStyleDeclaration>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // No text selected

    const selectedText = range.extractContents();
    const element = document.createElement(tagName);
    
    if (style) {
      Object.assign(element.style, style);
    }
    
    element.appendChild(selectedText);
    range.insertNode(element);
    
    // Clear selection
    selection.removeAllRanges();
    
    // Trigger change event
    handleChange();
  };

  const insertElement = (html: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    let range: Range;
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }

    const div = document.createElement('div');
    div.innerHTML = html;
    const fragment = document.createDocumentFragment();
    
    while (div.firstChild) {
      fragment.appendChild(div.firstChild);
    }
    
    range.insertNode(fragment);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      // Extract raw text for preview
      let rawText = editorRef.current.innerText || editorRef.current.textContent || '';
      rawText = rawText
        .replace(/\u00A0/g, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
      setRawTextValue(rawText);
    }
    handleChange();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    handleChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormatting('strong', { fontWeight: 'bold' });
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('em', { fontStyle: 'italic' });
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('u', { textDecoration: 'underline' });
          break;
      }
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const showHelp = () => {
    alert(`
Keyboard Shortcuts:
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+U: Underline

Markdown Support:
- # Heading 1
- ## Heading 2  
- ### Heading 3
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- \`inline code\`
- > Blockquote
- - List item
- 1. Numbered item
- [Link text](URL)
- ![Alt text](image URL)
- --- (Horizontal rule)
    `);
  };

  const getRawText = (): string => {
    if (rawTextValue) {
      return rawTextValue;
    }
    if (editorRef.current) {
      return editorRef.current.innerText || editorRef.current.textContent || '';
    }
    return '';
  };

  useEffect(() => {
    if (editorRef.current && value !== undefined && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      // Update raw text when value changes
      const rawText = editorRef.current.innerText || editorRef.current.textContent || '';
      setRawTextValue(rawText);
    }
  }, [value]);

  return (
    <div className="custom-rte-wrapper" style={{ height }}>
      {/* Toolbar */}
      <div className="rte-toolbar bg-gray-100 border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyFormatting('strong', { fontWeight: 'bold' })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <FaBold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormatting('em', { fontStyle: 'italic' })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <FaItalic className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormatting('u', { textDecoration: 'underline' })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Underline (Ctrl+U)"
            aria-label="Underline"
          >
            <FaUnderline className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormatting('s', { textDecoration: 'line-through' })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Strikethrough"
            aria-label="Strikethrough"
          >
            <FaStrikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyFormatting('h1', { fontSize: '2em', fontWeight: 'bold', margin: '16px 0' })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Heading 1"
            aria-label="Heading 1"
          >
            <FaHeading className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormatting('h2', { fontSize: '1.5em', fontWeight: 'bold', margin: '16px 0' })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Heading 2"
            aria-label="Heading 2"
          >
            <span className="text-xs font-bold">H2</span>
          </button>
          
          <button
            type="button"
            onClick={() => applyFormatting('h3', { fontSize: '1.25em', fontWeight: 'bold', margin: '16px 0' })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Heading 3"
            aria-label="Heading 3"
          >
            <span className="text-xs font-bold">H3</span>
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => insertElement('<ul style="margin: 16px 0; padding-left: 24px;"><li>List item</li></ul>')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bullet List"
            aria-label="Bullet List"
          >
            <FaListUl className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => insertElement('<ol style="margin: 16px 0; padding-left: 24px;"><li>List item</li></ol>')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Numbered List"
            aria-label="Numbered List"
          >
            <FaListOl className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => insertElement('<ul style="list-style: none; padding-left: 0; margin: 16px 0;"><li style="display: flex; align-items: center;"><input type="checkbox" style="margin-right: 8px;" />Task item</li></ul>')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Task List"
            aria-label="Task List"
          >
            <FaCheckSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Content Blocks */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyFormatting('blockquote', { 
              borderLeft: '4px solid #e5e7eb', 
              margin: '16px 0', 
              paddingLeft: '16px', 
              color: '#6b7280', 
              fontStyle: 'italic' 
            })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Quote"
            aria-label="Quote"
          >
            <FaQuoteLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormatting('code', { 
              backgroundColor: '#f3f4f6', 
              padding: '2px 4px', 
              borderRadius: '4px', 
              fontFamily: 'monospace', 
              fontSize: '0.9em' 
            })}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Inline Code"
            aria-label="Inline Code"
          >
            <FaCode className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => insertElement('<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Horizontal Rule"
            aria-label="Horizontal Rule"
          >
            <FaMinus className="w-4 h-4" />
          </button>
        </div>

        {/* Media */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter URL:');
              const text = prompt('Enter link text:');
              if (url && text) {
                insertElement(`<a href="${url}" style="color: #3b82f6; text-decoration: underline;">${text}</a>`);
              }
            }}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Link"
            aria-label="Insert Link"
          >
            <FaLink className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter image URL:', 'https://');
              const alt = prompt('Enter alt text:', '');
              if (url) {
                insertElement(`<img src="${url}" alt="${alt || ''}" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px;" />`);
              }
            }}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Image"
            aria-label="Insert Image"
          >
            <FaImage className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => {
              const rows = prompt('Enter number of rows:', '3');
              const cols = prompt('Enter number of columns:', '3');
              if (rows && cols) {
                let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #ddd;">';
                for (let i = 0; i < parseInt(rows); i++) {
                  tableHTML += '<tr>';
                  for (let j = 0; j < parseInt(cols); j++) {
                    if (i === 0) {
                      tableHTML += `<th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold;">Header ${j + 1}</th>`;
                    } else {
                      tableHTML += `<td style="padding: 8px; border: 1px solid #ddd;">Cell ${i + 1}-${j + 1}</td>`;
                    }
                  }
                  tableHTML += '</tr>';
                }
                tableHTML += '</table>';
                insertElement(tableHTML);
              }
            }}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Table"
            aria-label="Insert Table"
          >
            <FaTable className="w-4 h-4" />
          </button>
        </div>
        
        {/* Preview Toggle */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={togglePreview}
            className={`rte-toolbar-btn p-2 rounded transition-colors ${
              showPreview 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'hover:bg-gray-200'
            }`}
            title={showPreview ? "Switch to Edit Mode" : "Switch to Preview Mode"}
            aria-label={showPreview ? "Edit" : "Preview"}
          >
            {showPreview ? <FaEdit className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Help */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={showHelp}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Help & Shortcuts"
            aria-label="Help"
          >
            <FaQuestionCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor and Preview Container */}
      <div className="flex border border-gray-300 rounded-b-lg overflow-hidden" style={{ height: height - 60 }}>
        {/* Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300 ease-in-out`}>
          <div
            ref={editorRef}
            contentEditable
            className={`rte-editor w-full h-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              isFocused ? 'bg-white' : 'bg-gray-50'
            }`}
            style={{
              color: '#1f2937',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              minHeight: `${height - 60}px`,
              overflowY: 'auto'
            }}
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            data-placeholder={placeholder || "Start typing your content here..."}
            suppressContentEditableWarning={true}
          />
          
          {/* Placeholder */}
          {(!value || value === '') && !showPreview && (
            <div 
              className="absolute pointer-events-none text-gray-400 p-4"
              style={{ 
                top: '60px',
                left: '16px',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              {placeholder || "Start typing your content here..."}
            </div>
          )}
        </div>
        
        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l border-gray-300 bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 text-sm font-medium text-gray-700">
              Preview
            </div>
            <div 
              className="p-4 overflow-y-auto h-full"
              style={{
                color: '#1f2937',
                fontSize: '14px',
                lineHeight: '1.6',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                minHeight: `${height - 100}px`
              }}
              dangerouslySetInnerHTML={{ 
                __html: convertToHTML(getRawText()) || '<span style="color: #9ca3af;">No content to preview</span>' 
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Simple markdown preview component
export const MarkdownPreview = ({ content, source, ...props }: { 
  content?: string; 
  source?: string; 
  style?: React.CSSProperties;
  className?: string;
  [key: string]: unknown;
}) => {
  const displayContent = content || source || '';
  
  return (
    <div 
      className="markdown-preview p-4 border border-gray-300 rounded-lg bg-white"
      style={{ color: '#1f2937', ...props.style }}
      dangerouslySetInnerHTML={{ __html: displayContent }}
      {...props}
    />
  );
};

export default EnhancedRTE;
