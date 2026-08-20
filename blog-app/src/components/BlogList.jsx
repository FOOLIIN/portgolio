import PostCard from './PostCard.jsx';

export default function BlogList({ posts, onEditPost, onDeletePost }) {
  return (
    <section id="list-view">
      <h1>博客</h1>
      {posts.length === 0 ? (
        <p>没有文章</p>
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
