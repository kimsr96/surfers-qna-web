"use client";

import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Comments from "./Comments";

type Post = {
  id: string;
  category: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Board() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [aiWaiting, setAiWaiting] = useState<Set<string>>(new Set());

  async function load() {
    const { data, error } = await supabase
      .from("posts")
      .select("id, category, title, content, author, created_at")
      .eq("category", "Q&A")
      .order("created_at", { ascending: false });
    if (error) setError("글 목록을 불러오지 못했습니다.");
    else {
      setError("");
      setPosts(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const { data, error } = await supabase
      .from("posts")
      .insert({ category: "Q&A", title: title.trim(), content: content.trim(), author: "익명" })
      .select("id")
      .single();
    if (error) {
      setError("글을 등록하지 못했습니다.");
      return;
    }
    setTitle("");
    setContent("");
    setWriting(false);
    await load();
    requestAiComment(data.id);
  }

  // AI 댓글은 시간이 걸리므로 기다리지 않고 백그라운드로 요청한 뒤 끝나면 목록을 다시 불러온다.
  async function requestAiComment(postId: string) {
    setAiWaiting((s) => new Set(s).add(postId));
    await fetch("/api/ai-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch(() => {});
    setAiWaiting((s) => {
      const next = new Set(s);
      next.delete(postId);
      return next;
    });
  }

  return (
    <main className="window">
      <header className="titlebar">
        <span>■ 서퍼스 고객센터</span>
        <span className="dots">_ □ x</span>
      </header>

      <div className="body">
        <p className="subtitle">★ 수강생 질의응답 게시판 ★</p>

        <div className="toolbar">
          <span>총 {posts.length}개의 글</span>
          <button className="btn" onClick={() => setWriting((v) => !v)}>
            {writing ? "닫기" : "글쓰기"}
          </button>
        </div>

        {writing && (
          <form className="form" onSubmit={submit}>
            <label>
              카테고리
              <input value="Q&A" disabled />
            </label>
            <label>
              작성자
              <input value="익명" disabled />
            </label>
            <label>
              제목
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={100}
                required
              />
            </label>
            <label>
              내용
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="궁금한 내용을 적어주세요"
                rows={6}
                required
              />
            </label>
            <button className="btn primary" type="submit">
              등록
            </button>
          </form>
        )}

        <table className="list">
          <thead>
            <tr>
              <th className="c-no">번호</th>
              <th className="c-cat">분류</th>
              <th>제목</th>
              <th className="c-author">작성자</th>
              <th className="c-date">작성일</th>
            </tr>
          </thead>
          <tbody>
            {(loading || posts.length === 0) && (
              <tr>
                <td colSpan={5} className="empty">
                  {loading ? "불러오는 중..." : "아직 글이 없습니다."}
                </td>
              </tr>
            )}
            {posts.map((p, i) => (
              <Fragment key={p.id}>
                <tr
                  className="row"
                  onClick={() => setOpenId(openId === p.id ? null : p.id)}
                >
                  <td className="c-no">{posts.length - i}</td>
                  <td className="c-cat">[{p.category}]</td>
                  <td className="c-title">{p.title}</td>
                  <td className="c-author">{p.author}</td>
                  <td className="c-date">{formatDate(p.created_at)}</td>
                </tr>
                {openId === p.id && (
                  <tr className="detail">
                    <td colSpan={5}>
                      <div className="post-content">{p.content}</div>
                      <Comments postId={p.id} aiWaiting={aiWaiting.has(p.id)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {error && <p className="note error">{error}</p>}
      </div>
    </main>
  );
}
