'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { FaBold, FaItalic, FaListOl, FaListUl, FaUnderline, FaHeading, FaLink, FaUnlink } from 'react-icons/fa';
import { MdFormatColorText } from 'react-icons/md';
import { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null;
  }

  const buttonStyle = (isActive: boolean) => `
    p-2 rounded transition-all duration-200 
    ${isActive 
      ? 'bg-gold text-black' 
      : 'bg-black text-gold hover:bg-gold hover:text-black'
    }
  `;

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Add https:// if no protocol is specified
    const url = /^https?:\/\//.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
    
    // If there's no selection, don't do anything
    if (editor.state.selection.empty) {
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkMenu(false);
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
    }
  };

  return (
    <div className="border-b border-gold/30 bg-black rounded-t-lg">
      <div className="p-2 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={buttonStyle(editor.isActive('bold'))}
          title="Bold"
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={buttonStyle(editor.isActive('italic'))}
          title="Italic"
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonStyle(editor.isActive('underline'))}
          title="Underline"
        >
          <FaUnderline />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonStyle(editor.isActive('heading', { level: 2 }))}
          title="Heading"
        >
          <FaHeading />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonStyle(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <FaListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonStyle(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <FaListOl />
        </button>
        <button
          onClick={() => setShowLinkMenu(!showLinkMenu)}
          className={buttonStyle(editor.isActive('link'))}
          title="Add Link"
        >
          <FaLink />
        </button>
        {editor.isActive('link') && (
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            className={buttonStyle(false)}
            title="Remove Link"
          >
            <FaUnlink />
          </button>
        )}
        <div className={`flex items-center gap-1 ${buttonStyle(false)}`}>
          <MdFormatColorText />
          <input
            type="color"
            onInput={event => {
              editor.chain().focus().setColor((event.target as HTMLInputElement).value).run();
            }}
            value={editor.getAttributes('textStyle').color || '#ffffff'}
            className="w-6 h-6 bg-transparent cursor-pointer"
            title="Text Color"
          />
        </div>
      </div>
      
      {showLinkMenu && (
        <div className="p-2 border-t border-gold/30 flex gap-2">
          <input
            type="text"
            placeholder="Enter URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            className="flex-1 px-2 py-1 bg-black/50 border border-gold/30 rounded text-white focus:outline-none focus:border-gold"
          />
          <button
            onClick={setLink}
            className="px-3 py-1 bg-gold text-black rounded hover:bg-white transition-colors"
          >
            Add Link
          </button>
        </div>
      )}
    </div>
  );
};

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gold hover:underline cursor-pointer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none text-white min-h-[200px] p-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gold [&_h2]:mb-4 bg-black/80',
      },
    },
  });

  return (
    <div className="border border-gold/30 rounded-lg bg-black">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
} 