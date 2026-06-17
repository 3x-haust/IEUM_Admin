import { useEffect, useRef, type SyntheticEvent } from 'react';
import { logout, type HomeSnapshot } from '../../../api/adminApi';
import { roleLabel } from '../adminTypes';
import * as S from '../AdminDashboard.styled';

const profileAvatarSrc = '/assets/icons/profile-avatar.png';
const mirimOAuthServerUrl = import.meta.env.VITE_MIRIM_OAUTH_SERVER_URL ?? 'https://api-auth.mmhs.app';

function resolveProfileImageSrc(profileImageUrl: string | null): string {
  if (!profileImageUrl) {
    return profileAvatarSrc;
  }

  try {
    return new URL(profileImageUrl, mirimOAuthServerUrl).toString();
  } catch (error) {
    if (error instanceof TypeError) {
      return profileAvatarSrc;
    }

    throw error;
  }
}

function handleProfileImageError(event: SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.src = profileAvatarSrc;
}

type AdminHeaderProps = {
  readonly user: HomeSnapshot['user'];
  readonly token: string;
  readonly profileOpen: boolean;
  readonly setProfileOpen: (open: boolean) => void;
  readonly navigateLogin: () => void;
};

export function AdminHeader({ user, token, profileOpen, setProfileOpen, navigateLogin }: AdminHeaderProps) {
  const profileImageSrc = resolveProfileImageSrc(user.profileImageUrl);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileCardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (profileButtonRef.current?.contains(target)) return;
      if (profileCardRef.current?.contains(target)) return;
      setProfileOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen, setProfileOpen]);

  return (
    <S.Topbar>
      <S.HeaderLogo src="/assets/brand/ieum-header-logo.png" alt="IEUM" />
      <S.ProfileButton
        ref={profileButtonRef}
        type="button"
        onClick={() => setProfileOpen(!profileOpen)}
        aria-label="프로필"
        aria-expanded={profileOpen}
      >
        <S.ProfileAvatar>
          <img src={profileImageSrc} alt="" aria-hidden="true" onError={handleProfileImageError} />
        </S.ProfileAvatar>
      </S.ProfileButton>
      {profileOpen ? (
        <S.ProfileCard ref={profileCardRef}>
          <S.ProfileRow>
            <S.LargeAvatar src={profileImageSrc} alt="" aria-hidden="true" onError={handleProfileImageError} />
            <div>
              <S.ProfileName>{user.name}</S.ProfileName>
              <S.ProfileEmail>{user.email}</S.ProfileEmail>
              <S.ProfileEmail>{roleLabel(user.role)}</S.ProfileEmail>
            </div>
          </S.ProfileRow>
          <S.LogoutButton
            type="button"
            onClick={async () => {
              await logout(token).catch(() => undefined);
              navigateLogin();
            }}
          >
            <span>로그아웃</span>
            <S.LogoutIcon src="/assets/icons/logout.svg" alt="" aria-hidden="true" />
          </S.LogoutButton>
        </S.ProfileCard>
      ) : null}
    </S.Topbar>
  );
}
