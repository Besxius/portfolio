"use client";

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading3, RemoveFormatting } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background focus-within:ring-1 focus-within:ring-foreground transition-all">
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-muted/40 border-b border-border text-muted-foreground text-xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors ${editor.isActive('bold') ? 'bg-muted text-foreground font-bold' : ''}`}
          title="In đậm (Bold)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors ${editor.isActive('italic') ? 'bg-muted text-foreground italic' : ''}`}
          title="In nghiêng (Italic)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors ${editor.isActive('bulletList') ? 'bg-muted text-foreground' : ''}`}
          title="Danh sách gạch đầu dòng (Bullet List)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors ${editor.isActive('orderedList') ? 'bg-muted text-foreground' : ''}`}
          title="Danh sách số (Numbered List)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-muted text-foreground font-bold' : ''}`}
          title="Tiêu đề (Heading)"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors ml-auto"
          title="Xóa định dạng"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="p-3 text-sm min-h-[100px] max-h-[250px] overflow-y-auto focus:outline-none [&_.tiptap]:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 text-foreground"
      />
    </div>
  );
}
