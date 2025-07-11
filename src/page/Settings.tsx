import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Settings() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      alert('로그아웃 되었습니다.');
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = confirm('정말로 회원탈퇴를 하시겠습니까?');
    if (!confirmation) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    const { error } = await supabase.rpc('delete_user');

    if (error) {
      console.error('Error deleting account:', error.message);
      alert(`회원탈퇴 중 오류가 발생했습니다: ${error.message}`);
    } else {
      alert('회원탈퇴가 완료되었습니다.');
      navigate('/signup');
    }
  };

  return (
    <>
      <h1>설정</h1>
      <Link to="/change-password">비밀번호 변경</Link><br />
      <button onClick={handleLogout}>로그아웃</button><br />
      <button onClick={handleDeleteAccount}>회원탈퇴</button><br />
      <Link to="/">홈으로</Link>
    </>
  );
}

export default Settings;
