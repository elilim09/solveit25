import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error logging in:', error.message);
      alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
    } else {
      console.log('User logged in:', data.user);
      alert('로그인 되었습니다.');
      navigate('/');
    }
  };

  return (
    <>
      <h1>로그인</h1>
      <label>이메일</label>
      <input
        type="email"
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <label>비밀번호</label>
      <input
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleLogin}>로그인</button><br />
      <Link to="/signup">계정이 없으신가요? 회원가입하기</Link><br />
    </>
  );
}

export default Login;

