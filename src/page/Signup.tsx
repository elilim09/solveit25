import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSignup = async () => {
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          nickname,
        },
      },
    });

    if (error) {
      console.error('Error signing up:', error.message);
      alert(`회원가입 중 오류가 발생했습니다: ${error.message}`);
    } else {
      console.log('User signed up:', data.user);
      alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      navigate('/login');
    }
  };

  return (
    <>
      <h1>회원가입</h1>
      <label>이름</label>
      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br />
      <label>닉네임</label>
      <input
        type="text"
        placeholder="닉네임"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      /><br />
      <label>이메일</label>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <label>비밀번호</label>
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <label>비밀번호 확인</label>
      <input
        type="password"
        placeholder="비밀번호 확인"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      /><br />
      <button onClick={handleSignup}>회원가입</button><br />
      <Link to="/login">이미 계정이 있으신가요? 로그인하기</Link>
    </>
  );
}

export default Signup;

