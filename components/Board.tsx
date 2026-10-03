"use client";

import { Fragment, useState } from "react";

type Post = {
  id: number;
  category: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
};

// 데이터를 저장하지 않으므로 예시 글만 메모리에 올려둔다. 새로고침하면 초기화된다.
const INITIAL_POSTS: Post[] = [
  {
    id: 2,
    category: "Q&A",
    title: "수강 기간 연장은 어떻게 하나요?",
    content: "수강 기간이 곧 끝나는데 연장 신청 방법이 궁금합니다.",
    author: "익명",
    createdAt: "2026-10-02 15:20",
  },
  {
    id: 1,
    category: "Q&A",
    title: "강의 영상은 몇 번까지 볼 수 있나요?",
    content: "수강 기간 안에서는 횟수 제한 없이 볼 수 있는지 궁금해요.",
    author: "익명",
    createdAt: "2026-10-01 10:05",
  },
];

function now() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Board() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const next: Post = {
      id: Math.max(0, ...posts.map((p) => p.id)) + 1,
      category: "Q&A",
      title: title.trim(),
      content: content.trim(),
      author: "익명",
      createdAt: now(),
    };
    setPosts([next, ...posts]);
    setTitle("");
    setContent("");
    setWriting(false);
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
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  아직 글이 없습니다.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <Fragment key={p.id}>
                <tr
                  className="row"
                  onClick={() => setOpenId(openId === p.id ? null : p.id)}
                >
                  <td className="c-no">{p.id}</td>
                  <td className="c-cat">[{p.category}]</td>
                  <td className="c-title">{p.title}</td>
                  <td className="c-author">{p.author}</td>
                  <td className="c-date">{p.createdAt}</td>
                </tr>
                {openId === p.id && (
                  <tr className="detail">
                    <td colSpan={5}>{p.content}</td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        <p className="note">※ 작성한 글은 저장되지 않으며 새로고침하면 사라집니다.</p>
      </div>
    </main>
  );
}
