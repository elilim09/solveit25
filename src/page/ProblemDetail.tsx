import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';


interface Problem {
  id: string;
  title: string;
  content: string;
  author: string;
  profiles: {
    username: string;
  } | null;
}

interface Comment {
  id: string;
  created_at: string;
  content: string;
  author: string;
  profiles: {
    username: string;
  } | null;
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select('id, created_at, content, author, profiles:author(username)')
      .eq('problem_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data as any[]);
    }
  };

  useEffect(() => {
    const fetchProblemAndUser = async () => {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error } = await supabase
        .from('problems')
        .select('id, title, content, author, profiles:author(username)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching problem:', error);
      } else {
        setProblem(data as any);
      }
    };

    fetchProblemAndUser();
    fetchComments(); // 댓글 불러오기
  }, [id]);

  const handleDeleteProblem = async () => {
    if (!problem) return;
    const isConfirmed = window.confirm('정말로 이 문제를 삭제하시겠습니까?');
    if (isConfirmed) {
      const { error } = await supabase.from('problems').delete().match({ id: problem.id });
      if (error) {
        console.error('Error deleting problem:', error);
        alert('삭제에 실패했습니다.');
      } else {
        alert('문제가 삭제되었습니다.');
        navigate('/problem-board');
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id || !currentUser) {
      alert('댓글 내용을 입력하고 로그인해야 합니다.');
      return;
    }

    const { error } = await supabase.from('comments').insert({
      content: newComment,
      problem_id: id,
      author: currentUser.id,
    });

    if (error) {
      console.error('Error adding comment:', error);
      alert('댓글 추가에 실패했습니다.');
    } else {
      setNewComment('');
      fetchComments(); // 댓글 목록 새로고침
    }
  };

  const handleDeleteComment = async (commentId: string, commentAuthorId: string) => {
    if (!currentUser || currentUser.id !== commentAuthorId) {
      alert('댓글을 삭제할 권한이 없습니다.');
      return;
    }

    const isConfirmed = window.confirm('정말로 이 댓글을 삭제하시겠습니까?');
    if (isConfirmed) {
      const { error } = await supabase.from('comments').delete().match({ id: commentId });
      if (error) {
        console.error('Error deleting comment:', error);
        alert('댓글 삭제에 실패했습니다.');
      } else {
        fetchComments(); // 댓글 목록 새로고침
      }
    }
  };

  if (!problem) {
    return <div>문제를 찾을 수 없거나 불러오는 중입니다...</div>;
  }

  const isProblemAuthor = currentUser && currentUser.id === problem.author;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">작성자: {problem.profiles?.username || '알 수 없음'}</p>
        {isProblemAuthor && (
          <div className="flex gap-2">
            <Link to={`/edit-problem/${problem.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              수정
            </Link>
            <button onClick={handleDeleteProblem} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              삭제
            </button>
          </div>
        )}
      </div>
      <div className="border p-4 rounded">
        <p>{problem.content}</p>
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">댓글</h2>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border p-3 mb-2 rounded bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold">{comment.profiles?.username || '알 수 없음'}</p>
                <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
              <p className="text-gray-800">{comment.content}</p>
              {currentUser && currentUser.id === comment.author && (
                <button
                  onClick={() => handleDeleteComment(comment.id, comment.author)}
                  className="text-red-500 hover:text-red-700 text-sm mt-1"
                >
                  삭제
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">아직 댓글이 없습니다.</p>
        )}

        {/* 댓글 작성 폼 */}
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 mb-2"
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              댓글 작성
            </button>
          </form>
        ) : (
          <p className="mt-4 text-gray-600">댓글을 작성하려면 <Link to="/login" className="text-blue-500 hover:underline">로그인</Link> 해주세요.</p>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;