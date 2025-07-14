import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface CommunityPost {
  id: string;
  title: string;
  profiles: {
    username: string;
  } | null;
}

const CommunityBoard: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalCount, setTotalCount] = useState(0); // 전체 게시물 수
  const postsPerPage = 10; // 페이지당 게시물 수

  useEffect(() => {
    const fetchPosts = async () => {
      const from = page * postsPerPage;
      const to = from + postsPerPage - 1;

      const { data, error, count } = await supabase
        .from('community_posts')
        .select('id, title, profiles:author(username)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching community posts:', error);
      } else {
        setPosts(data as any[]);
        setTotalCount(count || 0);
      }
    };

    fetchPosts();
  }, [page]); // page가 변경될 때마다 다시 불러오도록 의존성 추가

  const totalPages = Math.ceil(totalCount / postsPerPage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">커뮤니티 게시판</h1>
      <div className="flex justify-end mb-4">
        <Link to="/create-community" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          새 글 작성
        </Link>
      </div>
      <ul>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id} className="border p-4 mb-2 rounded">
              <Link to={`/community/${post.id}`} className="text-xl font-semibold">{post.title}</Link>
              <p className="text-gray-600">작성자: {post.profiles?.username || '알 수 없음'}</p>
            </li>
          ))
        ) : (
          <p>게시물이 없습니다.</p>
        )}
      </ul>

      {/* 페이지네이션 컨트롤 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50"
        >
          이전
        </button>
        <span className="bg-gray-200 py-2 px-4 text-gray-800 font-bold">
          {page + 1} / {totalPages === 0 ? 1 : totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={page >= totalPages - 1}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default CommunityBoard;
