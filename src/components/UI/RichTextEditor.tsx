'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState, $getSelection, $isRangeSelection } from 'lexical';
import {
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
}

// Toolbar component
function ToolbarPlugin({ onImageUpload }: { onImageUpload?: (file: File) => Promise<string> }) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Update toolbar state based on selection
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  };

  const formatStrikethrough = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
  };

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
    '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
    '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
    '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛',
    '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
    '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗',
    '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️',
    '⭐', '🌟', '✨', '⚡', '🔥', '💥', '💫', '🌈',
    '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️',
    '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧',
    '💦', '☔', '🌊', '🌍', '🌎', '🌏', '🪐', '💫',
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
    '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
    '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
    '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺',
    '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣',
    '🎯', '🪀', '🪁', '🎮', '🕹️', '🎰', '🎲', '🧩',
    '♟️', '🎭', '🎨', '🧵', '🪡', '🧶', '🪢', '👓',
    '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣',
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇',
    '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
    '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
    '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐',
    '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈',
    '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭',
    '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮',
    '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜',
    '✅', '❌', '❎', '✔️', '☑️', '💯', '🔞', '🆘',
    '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫',
    '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫'
  ];

  const insertEmoji = (emoji: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(emoji);
      }
    });
    setShowEmojiPicker(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      const imageUrl = await onImageUpload(file);
      // Insert image as markdown in the editor
      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        const text = $createTextNode(`![${file.name}](${imageUrl})`);
        paragraph.append(text);
        root.append(paragraph);
      });
      e.target.value = '';
    } catch (error) {
      alert('Ошибка загрузки изображения');
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap border border-gray-300 rounded-t-md bg-gray-50 p-2 relative">
      <button
        type="button"
        onClick={formatBold}
        className={`p-2 hover:bg-gray-200 rounded transition-colors ${isBold ? 'bg-blue-200 text-blue-800' : 'text-gray-700'}`}
        title="Жирный (Ctrl+B)"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>
      
      <button
        type="button"
        onClick={formatItalic}
        className={`p-2 hover:bg-gray-200 rounded transition-colors ${isItalic ? 'bg-blue-200 text-blue-800' : 'text-gray-700'}`}
        title="Курсив (Ctrl+I)"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <line x1="14" y1="4" x2="10" y2="20" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      </button>
      
      <button
        type="button"
        onClick={formatUnderline}
        className={`p-2 hover:bg-gray-200 rounded transition-colors ${isUnderline ? 'bg-blue-200 text-blue-800' : 'text-gray-700'}`}
        title="Подчеркнутый (Ctrl+U)"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 5v8a5 5 0 0010 0V5M5 19h14" />
        </svg>
      </button>
      
      <button
        type="button"
        onClick={formatStrikethrough}
        className={`p-2 hover:bg-gray-200 rounded transition-colors ${isStrikethrough ? 'bg-blue-200 text-blue-800' : 'text-gray-700'}`}
        title="Зачеркнутый"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12M7 5h10M8 19h8" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300"></div>

      {/* Emoji Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-700"
          title="Вставить эмодзи"
        >
          <span className="text-lg">😀</span>
        </button>
        
        {showEmojiPicker && (
          <>
            {/* Backdrop to close picker */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowEmojiPicker(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50 max-h-[300px] overflow-y-auto w-[320px]">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 hover:bg-gray-100 rounded text-xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {onImageUpload && (
        <>
          <div className="w-px h-6 bg-gray-300"></div>
          <label className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-700 cursor-pointer" title="Загрузить изображение">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>
        </>
      )}
    </div>
  );
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Введите текст...',
  disabled = false,
  onImageUpload,
  className = '',
}) => {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: {
      paragraph: 'mb-2',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
      },
    },
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    editable: !disabled,
  };

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      onChange(text);
    });
  };

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin onImageUpload={onImageUpload} />
        <div className="relative border border-gray-300 border-t-0 rounded-b-md">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[150px] p-3 focus:outline-none text-gray-900"
                style={{ caretColor: 'black' }}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={(props: { children: React.ReactNode }) => <div>{props.children}</div>}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
        </div>
      </LexicalComposer>

      <style jsx global>{`
        .rich-text-editor-wrapper strong {
          font-weight: bold;
        }
        .rich-text-editor-wrapper em {
          font-style: italic;
        }
        .rich-text-editor-wrapper u {
          text-decoration: underline;
        }
        .rich-text-editor-wrapper s {
          text-decoration: line-through;
        }
        .rich-text-editor-wrapper img {
          max-width: 100%;
          max-height: 400px;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
