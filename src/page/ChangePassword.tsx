import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

function ChangePassword() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    if (!user || !user.email) {
      alert('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      return;
    }

    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    // 1. Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      console.error('Error verifying password:', signInError.message);
      alert('현재 비밀번호가 올바르지 않습니다.');
      return;
    }

    // 2. If verification is successful, update to the new password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      console.error('Error changing password:', updateError.message);
      alert(`비밀번호 변경 중 오류가 발생했습니다: ${updateError.message}`);
    } else {
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    }
  };

  return (
    <>
      <h1>비밀번호 변경</h1>
      <label>현재 비밀번호</label>
      <input
        type="password"
        placeholder="현재 비밀번호"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      /><br />
      <label>새 비밀번호</label>
      <input
        type="password"
        placeholder="새 비밀번호"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      /><br />
      <label>새 비밀번호 확인</label>
      <input
        type="password"
        placeholder="새 비밀번호 확인"
        value={newPasswordConfirm}
        onChange={(e) => setNewPasswordConfirm(e.target.value)}
      /><br />
      <button onClick={handleChangePassword}>비밀번호 변경</button><br />
      <Link to="/settings">설정으로 돌아가기</Link>
    </>
  );
}

export default ChangePassword;