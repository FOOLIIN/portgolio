function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostCard({ post, onEdit, onDelete }) {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      {post.date && <p className="post-date">{formatDate(post.date)}</p>}
      <p>{post.content}</p>
      <div className="post-actions">
        <button type="button" onClick={() => onEdit(post)}>编辑</button>
        <button type="button" className="delete-btn" onClick={() => onDelete(post.id)}>删除</button>
      </div>
    </div>
  );
}
