import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  profiles: {
    username: string;
  } | null;
}

interface CommunityComment {
  id: string;
  created_at: string;
  content: string;
  author: string;
  profiles: {
    username: string;
  } | null;
}

const CommunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('community_comments')
      .select('id, created_at, content, author, profiles:author(username)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching community comments:', error);
    } else {
      setComments(data as any[]);
    }
  };

  useEffect(() => {
    const fetchPostAndUser = async () => {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error } = await supabase
        .from('community_posts')
        .select('id, title, content, author, profiles:author(username)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching community post:', error);
      } else {
        setPost(data as any);
      }
    };

    fetchPostAndUser();
    fetchComments(); // 댓글 불러오기
  }, [id]);

  const handleDeletePost = async () => {
    if (!post) return;
    const isConfirmed = window.confirm('정말로 이 게시물을 삭제하시겠습니까?');
    if (isConfirmed) {
      const { error } = await supabase.from('community_posts').delete().match({ id: post.id });
      if (error) {
        console.error('Error deleting community post:', error);
        alert('삭제에 실패했습니다.');
      } else {
        alert('게시물이 삭제되었습니다.');
        navigate('/community-board');
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id || !currentUser) {
      alert('댓글 내용을 입력하고 로그인해야 합니다.');
      return;
    }

    const { error } = await supabase.from('community_comments').insert({
      content: newComment,
      post_id: id,
      author: currentUser.id,
    });

    if (error) {
      console.error('Error adding community comment:', error);
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
      const { error } = await supabase.from('community_comments').delete().match({ id: commentId });
      if (error) {
        console.error('Error deleting community comment:', error);
        alert('댓글 삭제에 실패했습니다.');
      } else {
        fetchComments(); // 댓글 목록 새로고침
      }
    }
  };

  if (!post) {
    return <div>게시물을 찾을 수 없거나 불러오는 중입니다...</div>;
  }

  const isPostAuthor = currentUser && currentUser.id === post.author;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">작성자: {post.profiles?.username || '알 수 없음'}</p>
        {isPostAuthor && (
          <div className="flex gap-2">
            <Link to={`/edit-community/${post.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              수정
            </Link>
            <button onClick={handleDeletePost} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              삭제
            </button>
          </div>
        )}
      </div>
      <div className="border p-4 rounded">
        <p>{post.content}</p>
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

export default CommunityDetail;
