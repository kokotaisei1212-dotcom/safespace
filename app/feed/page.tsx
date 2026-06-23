"use client";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  username: string;
  content: string;
  likes: number;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function loadPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.posts || []);
  }

  useEffect(() => { loadPosts(); }, []);

  async function handlePost() {
    if (!content.trim()) return;
    setPosting(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "guest", username: "you", content }),
    });
    setContent("");
    setPosting(false);
    setShowNew(false);
    loadPosts();
  }

  async function handleLike(id: string) {
    await fetch("/api/posts/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    loadPosts();
  }

  return (
    <main className="min-h-screen bg-white max-w-md mx-auto px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-gray-900">SafeSpace</h1>
        <button onClick={() => setShowNew(!showNew)} className="text-sm text-gray-400 hover:text-gray-900 transition">
          {showNew ? "Cancel" : "+ Post"}
        </button>
      </div>

      {showNew && (
        <div className="mb-6 border border-gray-100 rounded-xl p-4 bg-gray-50">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {posts.length === 0 && (
          <p className="text-center text-gray-300 text-sm py-12">No posts yet. Be the first.</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                {post.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-800">{post.username}</span>
              <span className="text-xs text-gray-300 ml-auto">{timeAgo(post.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4">
              <button onClick={() => handleLike(post.id)} className="text-xs text-gray-400 hover:text-gray-800 transition">
                {post.likes} likes
              </button>
              <button className="text-xs text-gray-400 hover:text-gray-800 transition">Reply</button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 max-w-md mx-auto">
        <button className="text-gray-900"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg></button>
        <button className="text-gray-300"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></button>
        <button className="text-gray-300"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>
        <button className="text-gray-300"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
      </div>
    </main>
  );
}
