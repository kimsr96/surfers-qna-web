"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Comment = {
  id: string;
  content: string;
  author: string;
  created_at: string;
  is_ai: boolean;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Comments({ postId, aiWaiting }: { postId: string; aiWaiting: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, author, created_at, is_ai")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) setError("댓글을 불러오지 못했습니다.");
    else {
      setError("");
      setComments(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, aiWaiting]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, content: text.trim(), author: "익명", is_ai: false });
    if (error) {
      setError("댓글을 등록하지 못했습니다.");
      return;
    }
    setText("");
    await load();
  }

  return (
    <div className="comments">
      <h3>댓글 {loading ? "" : comments.length}</h3>
      {aiWaiting && <p className="no-comment">AI가 답변을 작성하고 있어요...</p>}
      {!loading && !aiWaiting && comments.length === 0 && (
        <p className="no-comment">첫 댓글을 남겨보세요.</p>
      )}
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <div className="meta">
              {c.is_ai && <span className="badge">AI</span>}
              <b>{c.author}</b>
              <span>{formatDate(c.created_at)}</span>
            </div>
            <div className="text">{c.content}</div>
          </li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 입력하세요 (작성자: 익명)"
          maxLength={500}
          required
        />
        <button className="btn" type="submit">
          등록
        </button>
      </form>
      {error && <p className="note error">{error}</p>}
    </div>
  );
}
