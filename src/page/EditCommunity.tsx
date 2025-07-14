import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const EditCommunity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('community_posts')
        .select('title, content, author')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching community post for edit:', error);
        alert('게시물을 불러오는데 실패했습니다.');
        navigate('/community-board');
        return;
      }

      // 작성자 확인 로직 추가
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id !== data.author) {
        alert('수정 권한이 없습니다.');
        navigate(`/community/${id}`);
        return;
      }

      setTitle(data.title);
      setContent(data.content || '');
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const { error } = await supabase
      .from('community_posts')
      .update({ title, content })
      .match({ id });

    if (error) {
      console.error('Error updating community post:', error);
      alert('게시물 수정에 실패했습니다.');
    } else {
      alert('성공적으로 수정되었습니다.');
      navigate(`/community/${id}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">커뮤니티 글 수정</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 font-bold mb-2">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            수정 완료
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCommunity;
