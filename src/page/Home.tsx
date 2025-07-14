import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {user ? (
        <div>
          <h1>환영합니다, {user.user_metadata?.nickname || user.email}!</h1>
        </div>
      ) : (
        <div>
          <h1>홈</h1>
          <Link to="/login">로그인</Link>
          <br />
          <Link to="/signup">회원가입</Link>
        </div>
      )}
      <br />
      <Link to="/pro_create">문제생성하기</Link><br />
      <Link to="/pro_solve_chat">해답얻기</Link><br />
      <Link to="/problem-board">문제게시판</Link><br />
      <Link to="/community-board">커뮤니티</Link><br />
      <Link to="/helper">고객센터</Link><br />
      <Link to="/resources">자료실</Link><br />
      <Link to="/search">검색</Link><br />
      <Link to="/settings">설정</Link><br />
    </>
  );
}

export default Home;

