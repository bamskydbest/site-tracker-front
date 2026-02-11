import type { Comment } from '../../types/index.js';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (!comments.length) return null;

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">{typeof comment.admin === 'object' ? comment.admin?.name : 'Admin'}</span>
            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600">{comment.text}</p>
          <span className="text-xs text-gray-400 capitalize">{comment.step?.replace(/([A-Z])/g, ' $1')}</span>
        </div>
      ))}
    </div>
  );
}
