import { useState } from 'react';

export default function Editor({ initialPost = null, onSave, onBack }) {
  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [content, setContent] = useState(initialPost?.content ?? '');

  const canSave = title.trim() !== '' && content.trim() !== '';

  const handleSave = () => {
    if (!canSave) return;
    onSave({ title: title.trim(), content: content.trim() });
  };

  return (
    <section id="editor-view">
      <h1>{initialPost ? '编辑文章' : '写文章'}</h1>
      <input
        type="text"
        id="title-input"
        placeholder="文章标题"
        autoComplete="off"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="editor-row">
        <textarea
          id="editor"
          placeholder="写点什么..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div id="preview">{content}</div>
      </div>
      <div className="blog-actions">
        <button type="button" id="save-btn" onClick={handleSave} disabled={!canSave}>
          保存
        </button>
        <button type="button" id="back-btn" onClick={onBack}>
          返回列表
        </button>
      </div>
    </section>
  );
}
