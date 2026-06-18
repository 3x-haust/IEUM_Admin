import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clearStoredToken, fetchHomeSnapshot, readStoredToken, subscribeRealtimeEvents, type HomeSnapshot } from '../../api/adminApi';
import { AdminHeader } from './components/AdminHeader';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { StaffDashboard } from './components/StaffDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { type LoadStatus, type SortKey, type StaffViewKey } from './adminTypes';
import { createPreviewSnapshot, readPreviewRole } from './previewData';
import * as S from './AdminDashboard.styled';

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewRole = readPreviewRole(searchParams.get('preview'));
  const token = useMemo(() => readStoredToken(), []);
  const [view, setView] = useState<StaffViewKey>('contacts');
  const [studentProjectId, setStudentProjectId] = useState('all');
  const [sort, setSort] = useState<SortKey>('latest');
  const previewSnapshot = useMemo(() => (previewRole ? createPreviewSnapshot(previewRole) : null), [previewRole]);
  const [snapshot, setSnapshot] = useState<HomeSnapshot | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [message, setMessage] = useState('');
  const activeSnapshot = previewSnapshot ?? snapshot;
  const activeStatus: LoadStatus = previewSnapshot ? 'ready' : status;
  const isPreview = Boolean(previewSnapshot);

  const refresh = useCallback(async (options: { readonly silent?: boolean } = {}) => {
    if (!token) {
      navigate('/?preview=student', { replace: true });
      return;
    }
    await loadSnapshot(token, setSnapshot, setStatus, setMessage, navigate, options);
  }, [navigate, token]);

  useEffect(() => {
    if (previewSnapshot) return;
    void refresh();
  }, [previewSnapshot, refresh]);

  useEffect(() => {
    if (previewSnapshot || !token || activeStatus !== 'ready') return;
    let refreshTimer: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        void refresh({ silent: true });
      }, 250);
    };
    const realtime = subscribeRealtimeEvents({
      onMessage: scheduleRefresh,
    });
    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      realtime.close();
    };
  }, [activeStatus, previewSnapshot, refresh, token]);

  if (activeStatus === 'loading') return <DashboardSkeleton />;
  if (activeStatus === 'error' || !activeSnapshot) return <ErrorScreen message={message} onLogin={() => navigate('/login', { replace: true })} />;

  return (
    <S.Page>
      <AdminHeader
        user={activeSnapshot.user}
        token={token}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        navigateLogin={() => navigate('/login', { replace: true })}
      />
      {activeSnapshot.kind === 'student' ? (
        <StudentDashboard
          snapshot={activeSnapshot}
          projectId={studentProjectId}
          setProjectId={setStudentProjectId}
          sort={sort}
          setSort={setSort}
        />
      ) : (
        <StaffDashboard
          snapshot={activeSnapshot}
          view={view}
          setView={setView}
          sort={sort}
          setSort={setSort}
          token={token}
          refresh={refresh}
          isPreview={isPreview}
        />
      )}
    </S.Page>
  );
}

async function loadSnapshot(
  token: string,
  setSnapshot: (snapshot: HomeSnapshot | null) => void,
  setStatus: (status: LoadStatus) => void,
  setMessage: (message: string) => void,
  navigate: (to: string, options: { readonly replace: boolean }) => void,
  options: { readonly silent?: boolean } = {},
): Promise<void> {
  try {
    if (!options.silent) setStatus('loading');
    setSnapshot(await fetchHomeSnapshot(token));
    setMessage('');
    setStatus('ready');
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
    setMessage(caught.message);
    if (!options.silent) setStatus('error');
    if (caught.message.includes('401') || caught.message.includes('로그인') || caught.message.includes('Unauthorized')) {
      clearStoredToken();
      navigate('/login', { replace: true });
    }
  }
}

function ErrorScreen({ message, onLogin }: { readonly message: string; readonly onLogin: () => void }) {
  return (
    <S.Center>
      <S.ErrorText>{message || '데이터를 불러오지 못했습니다'}</S.ErrorText>
      <S.PrimaryButton type="button" onClick={onLogin}>
        로그인으로 이동
      </S.PrimaryButton>
    </S.Center>
  );
}

export default AdminDashboard;
