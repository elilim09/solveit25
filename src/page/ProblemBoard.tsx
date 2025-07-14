import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Problem {
  id: string;
  title: string;
  profiles: {
    username: string;
  } | null;
}

const ProblemBoard: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [page, setPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalCount, setTotalCount] = useState(0); // 전체 게시물 수
  const problemsPerPage = 10; // 페이지당 게시물 수

  useEffect(() => {
    const fetchProblems = async () => {
      const from = page * problemsPerPage;
      const to = from + problemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('problems')
        .select('id, title, profiles:author(username)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching problems:', error);
      } else {
        setProblems(data as any[]);
        setTotalCount(count || 0);
      }
    };

    fetchProblems();
  }, [page]); // page가 변경될 때마다 다시 불러오도록 의존성 추가

  const totalPages = Math.ceil(totalCount / problemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">문제 게시판</h1>
      <div className="flex justify-end mb-4">
        <Link to="/create-problem" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          문제 등록
        </Link>
      </div>
      <ul>
        {problems.length > 0 ? (
          problems.map((problem) => (
            <li key={problem.id} className="border p-4 mb-2 rounded">
              <Link to={`/problem/${problem.id}`} className="text-xl font-semibold">{problem.title}</Link>
              <p className="text-gray-600">작성자: {problem.profiles?.username || '알 수 없음'}</p>
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

export default ProblemBoard;