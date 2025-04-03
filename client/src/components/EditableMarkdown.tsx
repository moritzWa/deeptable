import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from './ui/textarea';

interface EditableMarkdownProps {
  content: string;
  onSave: (content: string) => void;
  isEditable: boolean;
  className?: string;
  placeholder?: string;
}

export function EditableMarkdown({
  content,
  onSave,
  isEditable,
  className,
  placeholder = 'Add markdown content...',
}: EditableMarkdownProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStartEditing = () => {
    if (!isEditable) return;
    setIsEditing(true);
    setEditedContent(content);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editedContent !== content) {
      onSave(editedContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedContent(content);
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={handleStartEditing}
        className={cn(
          'prose max-w-none',
          isEditable && 'cursor-pointer hover:bg-secondary/50 rounded-md p-2',
          !content && 'text-muted-foreground italic',
          className
        )}
      >
        {content ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          isEditable && <span>{placeholder}</span>
        )}
      </div>
    );
  }

  return (
    <Textarea
      ref={textareaRef}
      value={editedContent}
      onChange={(e) => setEditedContent(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={cn('min-h-[100px] font-mono', className)}
      placeholder={placeholder}
    />
  );
}

// Add this button component at the top of the file
export function AddTextButton({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground hover:border-muted-foreground/40 hover:text-muted-foreground/80 transition-colors"
    >
      + {text}
    </button>
  );
}
