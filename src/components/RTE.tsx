"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FaQuestionCircle,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaIndent,
  FaOutdent,
  FaEye,
  FaEdit
} from "react-icons/fa";

// Enhanced RTE component with proper styling
interface RTEPROPS {
  value?: string;
  onChange?: (value?: string) => void;
  height?: number;
  placeholder?: string;
}

// Improved function to convert markdown-like content to HTML
const convertToHTML = (content: string): string => {
  if (!content) return '';
  
  console.log('=== MARKDOWN CONVERSION START ===');
  console.log('Input content:', JSON.stringify(content));
  console.log('Content length:', content.length);
  console.log('Content type:', typeof content);
  
  // Normalize line endings and clean the content
  const cleanContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  
  console.log('Cleaned content:', JSON.stringify(cleanContent));
  
  // Split into lines for better processing
  const lines = cleanContent.split('\n');
  console.log('Lines:', lines);
  
  let html = '';
  let inList = false;
  let listType = '';
  let listItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`Processing line ${i + 1}: "${line}"`);
    
    if (!line) {
      // Empty line - close any open lists and add paragraph break
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      html += '<br>';
      continue;
    }
    
    // Check for headings
    if (line.startsWith('# ')) {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      const headingText = line.substring(2).trim();
      html += `<h1 style="font-size: 2em; font-weight: bold; margin: 16px 0; color: #1f2937;">${headingText}</h1>`;
      console.log(`Converted to H1: ${headingText}`);
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
      console.log(`Converted to H2: ${headingText}`);
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
      console.log(`Converted to H3: ${headingText}`);
      continue;
    }
    
    // Check for horizontal rules
    if (line === '---' || line === '***') {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      html += '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">';
      console.log('Converted to HR');
      continue;
    }
    
    // Check for blockquotes
    if (line.startsWith('> ')) {
      if (inList && listItems.length > 0) {
        html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      const quoteText = line.substring(2).trim();
      html += `<blockquote style="border-left: 4px solid #e5e7eb; margin: 16px 0; padding-left: 16px; color: #6b7280; font-style: italic;">${quoteText}</blockquote>`;
      console.log(`Converted to blockquote: ${quoteText}`);
      continue;
    }
    
    // Check for unordered lists
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
      console.log(`Added to UL: ${listText}`);
      continue;
    }
    
    // Check for ordered lists
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
      console.log(`Added to OL: ${listText}`);
      continue;
    }
    
    // Check for inline formatting
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
    
    // Regular text - close any open lists first
    if (inList && listItems.length > 0) {
      html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
      listItems = [];
      inList = false;
    }
    
    // Add the formatted line as a paragraph
    html += `<p style="margin: 8px 0; line-height: 1.6;">${formattedLine}</p>`;
    console.log(`Converted to paragraph: ${formattedLine}`);
  }
  
  // Close any remaining open lists
  if (inList && listItems.length > 0) {
    html += `<${listType} style="margin: 16px 0; padding-left: 24px;">${listItems.join('')}</${listType}>`;
  }
  
  console.log('=== FINAL HTML OUTPUT ===');
  console.log(html);
  console.log('=== MARKDOWN CONVERSION END ===');
  
  return html;
};

const EnhancedRTE = ({ value, onChange, height = 400, placeholder }: RTEPROPS) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const [rawTextValue, setRawTextValue] = useState(value || '');
  const [showPreview, setShowPreview] = useState(false);

  // Apply formatting with proper text selection handling
  const applyFormat = (command: string, value?: string) => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    // Ensure the editor is focused
    editor.focus();
    
    // If no text is selected, just apply the command
    if (selection.rangeCount === 0) {
      document.execCommand(command, false, value);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    // Check if the selection is within our editor
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    // Apply the command
    document.execCommand(command, false, value);
    
    // Restore focus
    editor.focus();
  };

  // Apply bold formatting with proper text selection
  const applyBold = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('bold', false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      console.log('Selected text for bold:', selectedText);
      
      // Check if the selection is already bold
      let parentElement = range.commonAncestorContainer.parentElement;
      let isAlreadyBold = false;
      
      while (parentElement && parentElement !== editor) {
        if (parentElement.tagName === 'B' || parentElement.tagName === 'STRONG' || 
            parentElement.style.fontWeight === 'bold' || parentElement.style.fontWeight === '700') {
          isAlreadyBold = true;
          break;
        }
        parentElement = parentElement.parentElement;
      }
      
      if (isAlreadyBold) {
        // Remove bold formatting by wrapping in normal text
        document.execCommand('insertHTML', false, selectedText);
      } else {
        // Apply bold formatting
        const boldHTML = `<strong style="font-weight: bold;">${selectedText}</strong>`;
        document.execCommand('insertHTML', false, boldHTML);
      }
      
      // Clear the selection after insertion
      selection.removeAllRanges();
    } else {
      document.execCommand('bold', false);
    }
    
    editor.focus();
  };

  // Apply italic formatting with proper text selection
  const applyItalic = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('italic', false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      console.log('Selected text for italic:', selectedText);
      
      // Check if the selection is already italic
      let parentElement = range.commonAncestorContainer.parentElement;
      let isAlreadyItalic = false;
      
      while (parentElement && parentElement !== editor) {
        if (parentElement.tagName === 'I' || parentElement.tagName === 'EM' || 
            parentElement.style.fontStyle === 'italic') {
          isAlreadyItalic = true;
          break;
        }
        parentElement = parentElement.parentElement;
      }
      
      if (isAlreadyItalic) {
        // Remove italic formatting by wrapping in normal text
        document.execCommand('insertHTML', false, selectedText);
      } else {
        // Apply italic formatting
        const italicHTML = `<em style="font-style: italic;">${selectedText}</em>`;
        document.execCommand('insertHTML', false, italicHTML);
      }
      
      // Clear the selection after insertion
      selection.removeAllRanges();
    } else {
      document.execCommand('italic', false);
    }
    
    editor.focus();
  };

  // Apply underline formatting with proper text selection
  const applyUnderline = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('underline', false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      // Check if the selection is already underlined
      const parentElement = range.commonAncestorContainer.parentElement;
      const isAlreadyUnderlined = parentElement?.tagName === 'U' || 
                                 parentElement?.style.textDecoration?.includes('underline');
      
      if (isAlreadyUnderlined) {
        // Remove underline formatting
        document.execCommand('underline', false);
      } else {
        // Apply underline formatting
        document.execCommand('underline', false);
      }
    } else {
      document.execCommand('underline', false);
    }
    
    editor.focus();
  };

  // Apply strikethrough formatting with proper text selection
  const applyStrikethrough = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('strikeThrough', false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      // Check if the selection is already strikethrough
      const parentElement = range.commonAncestorContainer.parentElement;
      const isAlreadyStrikethrough = parentElement?.tagName === 'S' || parentElement?.tagName === 'STRIKE' || 
                                    parentElement?.style.textDecoration?.includes('line-through');
      
      if (isAlreadyStrikethrough) {
        // Remove strikethrough formatting
        document.execCommand('strikeThrough', false);
      } else {
        // Apply strikethrough formatting
        document.execCommand('strikeThrough', false);
      }
    } else {
      document.execCommand('strikeThrough', false);
    }
    
    editor.focus();
  };

  // Apply unordered list formatting with proper text selection
  const applyUnorderedList = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('insertUnorderedList', false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      // Check if the selection is already in a list
      let parentElement = range.commonAncestorContainer.parentElement;
      while (parentElement && parentElement !== editor) {
        if (parentElement.tagName === 'UL' || parentElement.tagName === 'OL') {
          // Already in a list, remove list formatting
          document.execCommand('outdent', false);
          return;
        }
        parentElement = parentElement.parentElement;
      }
      
      // Apply unordered list formatting
      document.execCommand('insertUnorderedList', false);
    } else {
      document.execCommand('insertUnorderedList', false);
    }
    
    editor.focus();
  };

  // Apply ordered list formatting with proper text selection
  const applyOrderedList = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('insertOrderedList', false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      // Check if the selection is already in a list
      let parentElement = range.commonAncestorContainer.parentElement;
      while (parentElement && parentElement !== editor) {
        if (parentElement.tagName === 'UL' || parentElement.tagName === 'OL') {
          // Already in a list, remove list formatting
          document.execCommand('outdent', false);
          return;
        }
        parentElement = parentElement.parentElement;
      }
      
      // Apply ordered list formatting
      document.execCommand('insertOrderedList', false);
    } else {
      document.execCommand('insertOrderedList', false);
    }
    
    editor.focus();
  };

  // Apply blockquote formatting with proper text selection
  const applyBlockquote = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('formatBlock', false, '<blockquote>');
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      // Check if the selection is already in a blockquote
      let parentElement = range.commonAncestorContainer.parentElement;
      while (parentElement && parentElement !== editor) {
        if (parentElement.tagName === 'BLOCKQUOTE') {
          // Already in a blockquote, remove it
          const blockquoteContent = parentElement.innerHTML;
          parentElement.parentNode?.replaceChild(document.createTextNode(blockquoteContent), parentElement);
          return;
        }
        parentElement = parentElement.parentElement;
      }
      
      // Apply blockquote formatting
      document.execCommand('formatBlock', false, '<blockquote>');
    } else {
      document.execCommand('formatBlock', false, '<blockquote>');
    }
    
    editor.focus();
  };

  // Apply code block formatting with proper text selection
  const applyCodeBlock = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) return;
    
    editor.focus();
    
    if (selection.rangeCount === 0) {
      document.execCommand('formatBlock', false, '<pre>');
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    
    const selectedText = range.toString().trim();
    
    if (selectedText) {
      // Check if the selection is already in a code block
      let parentElement = range.commonAncestorContainer.parentElement;
      while (parentElement && parentElement !== editor) {
        if (parentElement.tagName === 'PRE') {
          // Already in a code block, remove it
          const codeContent = parentElement.innerHTML;
          parentElement.parentNode?.replaceChild(document.createTextNode(codeContent), parentElement);
          return;
        }
        parentElement = parentElement.parentElement;
      }
      
      // Apply code block formatting
      document.execCommand('formatBlock', false, '<pre>');
    } else {
      document.execCommand('formatBlock', false, '<pre>');
    }
    
    editor.focus();
  };

  // Insert horizontal rule
  const insertHR = () => {
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    document.execCommand('insertHorizontalRule', false);
  };

  // Debug function to log selection state
  const logSelectionState = () => {
    const selection = window.getSelection();
    if (!selection) {
      console.log('No selection object available');
      return;
    }
    
    console.log('Selection range count:', selection.rangeCount);
    console.log('Selection is collapsed:', selection.isCollapsed);
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      console.log('Range start container:', range.startContainer);
      console.log('Range end container:', range.endContainer);
      console.log('Range start offset:', range.startOffset);
      console.log('Range end offset:', range.endOffset);
      console.log('Selected text:', range.toString());
      console.log('Common ancestor:', range.commonAncestorContainer);
      
      // Check if selection is within editor
      const editor = editorRef.current;
      if (editor) {
        console.log('Selection within editor:', editor.contains(range.commonAncestorContainer));
      }
    }
  };

  // Insert heading with proper text selection handling
  const insertHeading = (level: number) => {
    console.log('=== INSERT HEADING CALLED ===');
    logSelectionState();
    
    const selection = window.getSelection();
    const editor = editorRef.current;
    
    if (!selection || !editor) {
      console.log('No selection or editor available');
      return;
    }
    
    editor.focus();
    
    const tag = `h${level}`;
    
    if (selection.rangeCount === 0) {
      console.log('No selection range, inserting new heading');
      // No selection, insert a new heading
      const headingHTML = `<${tag} style="font-size: ${level === 1 ? '2em' : level === 2 ? '1.5em' : '1.25em'}; font-weight: bold; margin: 16px 0; color: #1f2937;">Heading ${level}</${tag}>`;
      document.execCommand('insertHTML', false, headingHTML);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    // Check if the selection is within our editor
    if (!editor.contains(range.commonAncestorContainer)) {
      console.log('Selection is not within editor');
      return;
    }
    
    const selectedText = range.toString().trim();
    console.log('Selected text for heading:', selectedText, 'Length:', selectedText.length);
    
    if (selectedText && selectedText.length > 0) {
      console.log('Text is selected, wrapping in heading tags');
      // Text is selected, wrap it in heading tags
      
      // Create the heading HTML with the selected text
      const headingHTML = `<${tag} style="font-size: ${level === 1 ? '2em' : level === 2 ? '1.5em' : '1.25em'}; font-weight: bold; margin: 16px 0; color: #1f2937;">${selectedText}</${tag}>`;
      console.log('Heading HTML to insert:', headingHTML);
      
      // Use insertHTML to replace the selected content
      document.execCommand('insertHTML', false, headingHTML);
      
      // Clear the selection after insertion
      selection.removeAllRanges();
      console.log('Heading inserted successfully');
    } else {
      console.log('No text selected, inserting new heading');
      // No text selected, insert a new heading
      const headingHTML = `<${tag} style="font-size: ${level === 1 ? '2em' : level === 2 ? '1.5em' : '1.25em'}; font-weight: bold; margin: 16px 0; color: #1f2937;">Heading ${level}</${tag}>`;
      document.execCommand('insertHTML', false, headingHTML);
    }
    
    editor.focus();
  };

  // Insert table
  const insertTable = () => {
    const rows = prompt('Enter number of rows:', '3');
    const cols = prompt('Enter number of columns:', '3');
    
    if (rows && cols) {
      const tableHTML = generateTableHTML(parseInt(rows), parseInt(cols));
      document.execCommand('insertHTML', false, tableHTML);
      editorRef.current?.focus();
    }
  };

  // Generate table HTML
  const generateTableHTML = (rows: number, cols: number) => {
    let table = '<table border="1" style="border-collapse: collapse; width: 100%;">';
    
    for (let i = 0; i < rows; i++) {
      table += '<tr>';
      for (let j = 0; j < cols; j++) {
        if (i === 0) {
          table += '<th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Header ' + (j + 1) + '</th>';
        } else {
          table += '<td style="padding: 8px; border: 1px solid #ddd;">Cell ' + (i + 1) + '-' + (j + 1) + '</td>';
        }
      }
      table += '</tr>';
    }
    table += '</table>';
    return table;
  };

  // Insert image
  const insertImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    const alt = prompt('Enter image alt text:', '');
    
    if (url) {
      const imgHTML = `<img src="${url}" alt="${alt || ''}" style="max-width: 100%; height: auto;" />`;
      document.execCommand('insertHTML', false, imgHTML);
      editorRef.current?.focus();
    }
  };

  // Insert task list
  const insertTaskList = () => {
    const taskHTML = '<ul style="list-style: none; padding-left: 0;"><li style="margin: 5px 0;"><input type="checkbox" style="margin-right: 8px;" />Task item</li></ul>';
    document.execCommand('insertHTML', false, taskHTML);
    editorRef.current?.focus();
  };

  // Show help
  const showHelp = () => {
    const helpText = `
Keyboard Shortcuts:
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+U: Underline
- Ctrl+L: Insert Link
- Ctrl+K: Insert Code
- Enter: New paragraph
- Shift+Enter: New line
- Tab: Indent
- Shift+Tab: Outdent

Markdown Support:
- # Heading 1
- ## Heading 2
- ### Heading 3
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- Inline code (use backticks)
- > Blockquote
- - List item
- 1. Numbered item
- [Link text](URL)
- ![Alt text](image URL)
    `;
    alert(helpText);
  };

  // Enhanced input handler with better text extraction
  const handleInput = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      setInternalValue(newValue);
      
      // Extract raw text more reliably
      let rawText = '';
      
      // Method 1: Try innerText first
      if (editorRef.current.innerText) {
        rawText = editorRef.current.innerText;
      }
      // Method 2: Fallback to textContent
      else if (editorRef.current.textContent) {
        rawText = editorRef.current.textContent;
      }
      // Method 3: Create a temporary div to extract text
      else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newValue;
        rawText = tempDiv.textContent || tempDiv.innerText || '';
      }
      
      // Clean up the raw text
      rawText = rawText
        .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
        .replace(/\r\n/g, '\n')   // Normalize line endings
        .replace(/\r/g, '\n')
        .trim();
      
      setRawTextValue(rawText);
      
      console.log('=== INPUT HANDLER DEBUG ===');
      console.log('HTML value:', newValue);
      console.log('Raw text extracted:', rawText);
      console.log('Raw text length:', rawText.length);
      console.log('Raw text JSON:', JSON.stringify(rawText));
      
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  // Handle paste to clean HTML and prevent reverse typing
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Insert text at cursor position properly
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      // Fallback for browsers that don't support insertText
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    // Update internal value
    setTimeout(() => {
      if (editorRef.current) {
        const newValue = editorRef.current.innerHTML;
        setInternalValue(newValue);
        if (onChange) {
          onChange(newValue);
        }
      }
    }, 0);
  };

  // Handle key events properly
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      applyFormat('insertParagraph');
    }
    
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent', false);
      } else {
        document.execCommand('indent', false);
      }
    }
  };

  // Handle composition events for better text input
  const handleCompositionStart = () => {
    // Handle IME input start
  };

  const handleCompositionEnd = () => {
    // Update value after IME composition ends
    setTimeout(() => {
      if (editorRef.current) {
        const newValue = editorRef.current.innerHTML;
        setInternalValue(newValue);
        if (onChange) {
          onChange(newValue);
        }
      }
    }, 0);
  };

  // Set initial content and handle value changes
  useEffect(() => {
    if (editorRef.current && value !== undefined && value !== internalValue) {
      editorRef.current.innerHTML = value;
      setInternalValue(value);
    }
  }, [value, internalValue]);

  // Focus management
  const handleFocus = () => {
    setIsFocused(true);
    // Ensure cursor is at the end when focusing
    if (editorRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
    console.log('Preview toggled:', !showPreview);
  };

  // Get the raw text content for markdown conversion
  const getRawText = (): string => {
    console.log('=== GET RAW TEXT DEBUG ===');
    
    // Use the stored raw text value first
    if (rawTextValue) {
      console.log('Using stored raw text:', rawTextValue);
      console.log('Stored raw text length:', rawTextValue.length);
      console.log('Stored raw text JSON:', JSON.stringify(rawTextValue));
      return rawTextValue;
    }
    
    if (editorRef.current) {
      // Get the raw text content, not HTML
      const rawText = editorRef.current.innerText || editorRef.current.textContent || '';
      console.log('Raw text extracted from DOM:', rawText);
      
      // If we got HTML content, try to extract just the text
      if (rawText.includes('<') || rawText.includes('>')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawText;
        const cleanText = tempDiv.textContent || tempDiv.innerText || '';
        console.log('Cleaned HTML to text:', cleanText);
        return cleanText;
      }
      
      return rawText;
    }
    
    // Fallback: clean HTML tags from internal value
    const cleanText = internalValue.replace(/<[^>]*>/g, '') || '';
    console.log('Clean text from internal value:', cleanText);
    return cleanText;
  };

  return (
    <div className="custom-rte-wrapper" style={{ height: height }}>
      {/* Enhanced Toolbar */}
      <div className="rte-toolbar bg-gray-100 border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyBold()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <FaBold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyItalic()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <FaItalic className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyUnderline()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <FaUnderline className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyStrikethrough()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Strikethrough"
          >
            <FaStrikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => insertHeading(1)}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Heading 1"
          >
            <FaHeading className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => insertHeading(2)}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Heading 2"
          >
            <span className="text-xs font-bold">H2</span>
          </button>
          
          <button
            type="button"
            onClick={() => insertHeading(3)}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Heading 3"
          >
            <span className="text-xs font-bold">H3</span>
          </button>
        </div>

        {/* Lists and Structure */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyUnorderedList()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bullet List"
          >
            <FaListUl className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyOrderedList()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Numbered List"
          >
            <FaListOl className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={insertTaskList}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Task List"
          >
            <FaCheckSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Content Blocks */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyBlockquote()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Quote"
          >
            <FaQuoteLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyCodeBlock()}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Code Block"
          >
            <FaCode className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={insertHR}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Horizontal Rule"
          >
            <FaMinus className="w-4 h-4" />
          </button>
        </div>

        {/* Media and Links */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) applyFormat('createLink', url);
            }}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Link (Ctrl+L)"
          >
            <FaLink className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={insertImage}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Image"
          >
            <FaImage className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={insertTable}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Table"
          >
            <FaTable className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment and Indentation */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyFormat('justifyLeft')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Align Left"
          >
            <FaAlignLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormat('justifyCenter')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Align Center"
          >
            <FaAlignCenter className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormat('justifyRight')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Align Right"
          >
            <FaAlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Indentation */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => applyFormat('indent')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Indent (Tab)"
          >
            <FaIndent className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormat('outdent')}
            className="rte-toolbar-btn p-2 hover:bg-gray-200 rounded transition-colors"
            title="Outdent (Shift+Tab)"
          >
            <FaOutdent className="w-4 h-4" />
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
            title="Help & Keyboard Shortcuts"
          >
            <FaQuestionCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor and Preview Container */}
      <div className="flex border border-gray-300 rounded-b-lg overflow-hidden" style={{ height: height - 60 }}>
        {/* Editor */}
        <div 
          className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300 ease-in-out`}
          style={{ display: showPreview ? 'block' : 'block' }}
        >
          <div
            ref={editorRef}
            contentEditable
            className={`rte-editor w-full h-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              isFocused ? 'bg-white' : 'bg-gray-50'
            }`}
            style={{
              color: '#1f2937',
              backgroundColor: isFocused ? '#ffffff' : '#f9fafb',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              direction: 'ltr',
              textAlign: 'left',
              overflowY: 'auto'
            }}
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseUp={() => {
              // Log selection state when mouse is released (after text selection)
              setTimeout(() => {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const selectedText = selection.toString().trim();
                  if (selectedText) {
                    console.log('Text selected via mouse:', selectedText);
                  }
                }
              }, 10);
            }}
            suppressContentEditableWarning={true}
            data-placeholder={placeholder || "Start typing your content here..."}
          />
          
          {/* Placeholder text (shown when empty) */}
          {!internalValue && !showPreview && (
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
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
              dangerouslySetInnerHTML={{ 
                __html: convertToHTML(getRawText()) || '<span class="text-gray-400">No content to preview</span>' 
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