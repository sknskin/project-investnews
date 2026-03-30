"use client";

import { useState, useEffect } from "react";

interface BookmarkData {
  link: string;
  title: string;
  source: string;
  savedAt: string;
}

// 로컬스토리지 키
// LocalStorage key
const STORAGE_KEY = "investnews-bookmarks";

/**
 * 저장된 북마크 목록을 가져온다.
 * Retrieves saved bookmarks from localStorage.
 */
function getBookmarks(): BookmarkData[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    console.error("북마크 로드 실패 / Failed to load bookmarks:", error);
    return [];
  }
}

/**
 * 북마크 목록을 저장한다.
 * Saves bookmarks to localStorage.
 */
function saveBookmarks(bookmarks: BookmarkData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error("북마크 저장 실패 / Failed to save bookmarks:", error);
  }
}

export default function BookmarkButton({
  link,
  title,
  source,
}: {
  link: string;
  title: string;
  source: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getBookmarks().some((b) => b.link === link));
  }, [link]);

  // 북마크 토글 핸들러
  // Bookmark toggle handler
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const bookmarks = getBookmarks();
    if (saved) {
      saveBookmarks(bookmarks.filter((b) => b.link !== link));
      setSaved(false);
    } else {
      saveBookmarks([
        ...bookmarks,
        { link, title, source, savedAt: new Date().toISOString() },
      ]);
      setSaved(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-1 rounded-md hover:bg-accent transition-colors"
      title={saved ? "북마크 해제" : "북마크 추가"}
      aria-label={saved ? "Remove bookmark" : "Add bookmark"}
    >
      <svg
        className={`w-3.5 h-3.5 ${saved ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
        />
      </svg>
    </button>
  );
}
