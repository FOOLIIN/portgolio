import PostCard from './PostCard.jsx';

export default function BlogList({ posts, onNewPost, onEditPost, onDeletePost }) {
  return (
    <section id="list-view">
      <h1>博客</h1>
      <button type="button" className="blog-new-btn" onClick={onNewPost}>
        写新文章
      </button>
      {posts.length === 0 ? (
        <p className="post-empty">还没有文章，点“写新文章”开始吧。</p>
      ) : (
        <div id="post-list">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={onEditPost}
              onDelete={onDeletePost}
            />
          ))}
        </div>
      )}
    </section>
  );
}
