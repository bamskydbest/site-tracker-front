import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.js';
import { addComment } from '../../services/commentService.js';
import type { Comment } from '../../types/index.js';

interface CommentFormProps {
  visitId: string;
  step: string;
  onComment: (comment: Comment) => void;
}

export default function CommentForm({ visitId, step, onComment }: CommentFormProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const comment = await addComment(visitId, text.trim(), step);
      setText('');
      onComment(comment);
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Add a comment..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <Button size="sm" onClick={handleSubmit} loading={loading} disabled={!text.trim()}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
