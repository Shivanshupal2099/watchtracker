// Core Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';

// Tiptap Extensions
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Highlighter,
  Palette,
  CheckSquare,
  Undo2,
  Redo2,
  Code,
  Quote,
  Minus,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return (
      <div className={cn('border rounded-md min-h-[200px] p-4')}>
        <div className="animate-pulse flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Add https:// if no protocol exists
    const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: formattedUrl, target: '_blank', rel: 'noopener noreferrer' })
      .run();
  };

  const addImage = () => {
    const url = window.prompt('Enter the URL of the image:');
    if (!url) return;
    
    // Add https:// if no protocol exists and it's not a data URL
    const formattedUrl = url.match(/^(https?:\/\/|data:image\/)/) 
      ? url 
      : `https://${url}`;
      
    editor
      .chain()
      .focus()
      .setImage({ 
        src: formattedUrl,
        alt: 'User uploaded image',
        title: 'User uploaded image',
        style: 'max-width: 100%; height: auto;'
      })
      .run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const buttonClass = "p-2 rounded hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const activeButtonClass = "bg-accent text-accent-foreground";
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editor) return;
    
    // Add keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      switch (e.key.toLowerCase()) {
        case 'b':
          editor.chain().focus().toggleBold().run();
          break;
        case 'i':
          editor.chain().focus().toggleItalic().run();
          break;
        case 'u':
          editor.chain().focus().toggleUnderline().run();
          break;
        case 's':
          if (e.shiftKey) {
            editor.chain().focus().toggleStrike().run();
          }
          break;
        case 'z':
          if (e.shiftKey) {
            editor.chain().focus().redo().run();
          } else {
            editor.chain().focus().undo().run();
          }
          break;
        case 'y':
          editor.chain().focus().redo().run();
          break;
        case 'k':
          setLink();
          break;
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('bold'),
        })}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('italic'),
        })}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('underline'),
        })}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('strike'),
        })}
        title="Strikethrough (Ctrl+Shift+S)"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('heading', { level: 1 }),
        })}
        title="Heading 1"
      >
        H1
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('heading', { level: 2 }),
        })}
        title="Heading 2"
      >
        H2
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('bulletList'),
        })}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('orderedList'),
        })}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('taskList'),
        })}
        title="Task List"
      >
        <CheckSquare className="w-4 h-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive({ textAlign: 'left' }),
        })}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive({ textAlign: 'center' }),
        })}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive({ textAlign: 'right' }),
        })}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive({ textAlign: 'justify' }),
        })}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setLink()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('link'),
        })}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addImage}
        className={buttonClass}
        title="Add Image"
      >
        <ImageIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('highlight'),
        })}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('code'),
        })}
        title="Code"
      >
        <Code className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(buttonClass, {
          [activeButtonClass]: editor.isActive('blockquote'),
        })}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={buttonClass}
        title="Horizontal Rule"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <div className="relative group">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(buttonClass, 'flex items-center gap-1')}
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
          <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
        </Button>
        <div className="absolute z-10 hidden group-hover:block bg-popover p-2 rounded-md shadow-lg border">
          <div className="grid grid-cols-6 gap-1 w-48">
            {['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded-full border border-border"
                style={{ backgroundColor: color }}
                onClick={() => setColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={buttonClass}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={buttonClass}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export interface RichTextEditorProps {
  /** The initial content of the editor */
  content?: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
}

export const RichTextEditor = ({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
  readOnly = false,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
        validate: (url) => /^https?:\/\//.test(url),
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
    },
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={cn('border rounded-md flex flex-col', className)}>
      {!readOnly && <MenuBar editor={editor} />}
      <div className="relative flex-1">
        <EditorContent 
          editor={editor} 
          className={cn(
            'p-4 min-h-[200px] overflow-y-auto',
            'focus:outline-none',
            'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none',
            'prose-headings:font-semibold',
            'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
            'prose-p:my-2',
            'prose-ul:list-disc prose-ol:list-decimal',
            'prose-li:my-0',
            'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
            'prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/50 prose-blockquote:pl-4 prose-blockquote:italic',
            'prose-hr:border-t-2 prose-hr:border-muted-foreground/20',
            'prose-img:rounded-md prose-img:border prose-img:border-border',
            'prose-a:text-primary hover:prose-a:underline',
            'is-editor-empty:before:content-[attr(data-placeholder)] is-editor-empty:before:text-muted-foreground is-editor-empty:before:float-left is-editor-empty:before:h-0 is-editor-empty:before:pointer-events-none',
            readOnly && 'border-t-0 rounded-t-none',
            !readOnly && 'border-t rounded-t-none'
          )}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
