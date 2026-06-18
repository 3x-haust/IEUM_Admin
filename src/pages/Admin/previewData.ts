import type { AdminSnapshot, AdminUser, Contact, ContactStatus, Feedback, FeedbackStatus, HomeSnapshot, ProjectSummary, StudentSnapshot } from '../../api/adminApi';

export type PreviewRole = 'teacher' | 'student';

const previewProjects: readonly ProjectSummary[] = [
  project('project-growvy', 'Growvy', 'Growvy', '호주 Gap Year 청년들이 다양한 경험을 통해 자신의 적성을 발견하고 기록하는 구인구직 서비스', 'global', 'G1', 14, 2, 52),
  project('project-bbei', '쁘이', '쁘이', '랜덤 이모지를 따라하고 추억을 남기는 표정 게임 서비스', 'creative', 'E1', 21, 0, 87),
  project('project-checkit', '체크잇', '체크잇', '학교 분실물을 사진으로 미리 확인할 수 있는 웹서비스. 불필요한 교무실 방문없이 온라인으로 분실물을 조회합니다', 'journey', 'F4', 9, 1, 34),
  project('project-sebastian', '세바스찬', '세바스찬', '관람객이 직접 그린 물고기로 하나의 바다를 만드는 전시 서비스', 'creative', 'E3', 17, 1, 73),
  project('project-workit', 'WorkIt', 'WorkIt', '호주 현지 고용주와 워킹홀리데이 참가자를 연결하는 신뢰 기반 구인구직 및 급여 관리 플랫폼', 'global', 'G3', 8, 1, 41),
  project('project-idealzip', '이상형.zip', '이상형.zip', '제스처 기반 이상형 월드컵 서비스', 'personal', 'D6', 12, 1, 61),
];

const teacherUser: AdminUser = {
  id: 'preview-teacher',
  name: '이음',
  email: 'teacher@demo.com',
  profileImageUrl: null,
  role: 'teacher',
};

const adminUser: AdminUser = {
  id: 'preview-admin',
  name: '관리자',
  email: 'admin@demo.com',
  profileImageUrl: null,
  role: 'admin',
};

const studentUser: AdminUser = {
  id: 'preview-student',
  name: '3515 정지영',
  email: 'ieum@demo.com',
  profileImageUrl: null,
  role: 'student',
};

const previewStudents: readonly AdminUser[] = [
  studentUser,
  { ...studentUser, id: 'preview-student-2', name: '3208 김하린', email: 'harin@demo.com' },
  { ...studentUser, id: 'preview-student-3', name: '3102 박서준', email: 'seojun@demo.com' },
  { ...studentUser, id: 'preview-student-4', name: '3611 이도윤', email: 'doyun@demo.com' },
  { ...studentUser, id: 'preview-student-5', name: '3409 한지원', email: 'jiwon@demo.com' },
];

export function readPreviewRole(value: string | null): PreviewRole | null {
  if (value === 'teacher' || value === 'student') return value;
  return null;
}

export function createPreviewSnapshot(role: PreviewRole): HomeSnapshot {
  if (role === 'student') return createStudentSnapshot();
  return createStaffSnapshot(teacherUser);
}

function createStudentSnapshot(): StudentSnapshot {
  const growvy = previewProjects[0];
  const bbei = previewProjects[1];
  return {
    kind: 'student',
    user: studentUser,
    projects: [growvy, bbei],
    projectFeedback: [
      {
        project: growvy,
        feedback: {
          items: [
            feedback('student-feedback-growvy-1', growvy.id, '갭이어라는 주제가 신선했어요. 경험 기록이 커리어로 이어지는 흐름이 설득력 있습니다.', '2026-06-10T10:21:00+09:00'),
            feedback('student-feedback-growvy-2', growvy.id, '부스 설명이 친절해서 이해하기 쉬웠어요. 실제 호주 현지 데이터가 들어가면 더 좋을 것 같아요.', '2026-06-10T13:47:00+09:00'),
            feedback('student-feedback-growvy-3', growvy.id, '온보딩 화면 디자인이 깔끔합니다. 매칭 알고리즘이 어떻게 동작하는지 궁금해졌어요.', '2026-06-11T09:58:00+09:00'),
          ],
          nextCursor: null,
        },
      },
      {
        project: bbei,
        feedback: {
          items: [
            feedback('student-feedback-bbei-1', bbei.id, '표정 게임 직접 해봤는데 너무 재밌었어요! 찍은 사진을 바로 저장할 수 있는 점이 좋네요.', '2026-06-10T15:12:00+09:00'),
            feedback('student-feedback-bbei-2', bbei.id, '아이들이랑 같이 체험하기 좋은 서비스 같아요. 이모지 종류가 더 다양해지면 좋겠습니다.', '2026-06-11T11:05:00+09:00'),
          ],
          nextCursor: null,
        },
      },
    ],
  };
}

function createStaffSnapshot(user: AdminUser): AdminSnapshot & { readonly kind: 'staff' } {
  return {
    kind: 'staff',
    user,
    dashboard: {
      projectCount: previewProjects.length,
      feedbackCount: 12,
      contactCount: 6,
      newContactCount: 3,
      interestCount: 348,
      feedbackByStatus: { public: 11, blocked: 1 },
      feedbackByAgeGroup: { adult: 6, youth: 4, senior: 2 },
      feedbackByGender: { male: 5, female: 7 },
      feedbackByVisitorType: { general: 9, recruiter: 3 },
      contactsByStatus: { new: 3, checked: 3 },
    },
    projects: { items: previewProjects, nextCursor: null },
    feedback: { items: previewStaffFeedback(), nextCursor: null },
    contacts: { items: previewContacts(), nextCursor: null },
    users: { items: [adminUser, teacherUser, ...previewStudents], nextCursor: null },
    bannedWords: {
      items: [
        { id: 'preview-word-1', word: '욕설', isActive: true },
        { id: 'preview-word-2', word: '비방', isActive: true },
      ],
      nextCursor: null,
    },
  };
}

function previewStaffFeedback(): readonly Feedback[] {
  const [growvy, bbei, checkit, sebastian, workit, idealzip] = previewProjects;
  return [
    feedback('staff-feedback-1', growvy.id, '갭이어 경험을 기록으로 남긴다는 발상이 좋았습니다. 실제 사용해보고 싶어요.', '2026-06-11T13:26:00+09:00'),
    feedback('staff-feedback-2', growvy.id, '구인구직 매칭 흐름이 자연스럽습니다. 발표도 자신감 있게 잘하시네요.', '2026-06-10T11:32:00+09:00'),
    feedback('staff-feedback-3', bbei.id, '가족 단위 관람객이 즐기기 딱 좋아요. 줄 서서 기다릴 만한 가치가 있었습니다.', '2026-06-11T10:44:00+09:00'),
    feedback('staff-feedback-4', bbei.id, '인식 속도가 빨라서 놀랐어요. 결과 사진 공유 기능까지 세심하게 챙긴 점이 좋습니다.', '2026-06-10T16:08:00+09:00'),
    feedback('staff-feedback-5', checkit.id, '분실물 찾으러 교무실 안 가도 된다는 게 진짜 필요했던 기능이에요.', '2026-06-10T12:19:00+09:00'),
    feedback('staff-feedback-6', checkit.id, '사진으로 미리 확인하는 아이디어가 실용적입니다. 다른 학교에도 퍼지면 좋겠어요.', '2026-06-11T09:21:00+09:00'),
    feedback('staff-feedback-7', sebastian.id, '제가 그린 물고기가 바다에서 헤엄치는 걸 보니 감동이었어요. 아이가 정말 좋아했습니다.', '2026-06-10T14:53:00+09:00'),
    feedback('staff-feedback-8', sebastian.id, '전시 연출이 인상적이에요. 그림이 실시간으로 반영되는 게 신기했습니다.', '2026-06-11T11:37:00+09:00'),
    feedback('staff-feedback-9', workit.id, '워킹홀리데이 급여 관리까지 묶은 점이 차별화 포인트네요. 시장 조사가 탄탄해 보입니다.', '2026-06-10T10:47:00+09:00'),
    feedback('staff-feedback-10', workit.id, '신뢰 기반 매칭이라는 방향이 좋습니다. 후기 검증 로직이 더 궁금해요.', '2026-06-11T14:02:00+09:00'),
    feedback('staff-feedback-11', idealzip.id, '제스처로 고르는 이상형 월드컵이라니, 체험 줄이 제일 길었던 이유가 있네요.', '2026-06-10T15:41:00+09:00'),
    feedback('staff-feedback-12', idealzip.id, '광고같은 내용이라 가렸습니다', '2026-06-10T17:25:00+09:00', 'blocked'),
  ];
}

function previewContacts(): readonly Contact[] {
  const [growvy, , checkit, sebastian, workit, idealzip] = previewProjects;
  return [
    contact('preview-contact-1', growvy, previewStudents[0], '김민준', '네이버', 'BX 디자인 리크루터', 'minjun.kim@navercorp.com', '010-2347-8821', '부스 시연 인상 깊게 봤습니다. 디자인 직군 인턴십 관련해 이야기 나누고 싶습니다.', 'new', '2026-06-11T10:24:00+09:00'),
    contact('preview-contact-2', growvy, previewStudents[0], '이서연', '토스', '프로덕트 디자이너 리드', 'seoyeon.lee@toss.im', '010-8812-4470', 'Growvy 온보딩 화면 디자인이 좋네요. 디자인 포트폴리오 공유 부탁드립니다.', 'checked', '2026-06-10T14:05:00+09:00'),
    contact('preview-contact-3', checkit, previewStudents[1], '박지훈', '카카오', '채용 담당자', 'jihoon.park@kakaocorp.com', '010-5529-1183', '체크잇 문제 정의가 명확합니다. 동계 개발 인턴십에 추천하고 싶습니다.', 'new', '2026-06-11T11:42:00+09:00'),
    contact('preview-contact-4', sebastian, previewStudents[2], '최하린', '당근', '서비스 기획자', 'harin.choi@daangn.com', '010-9034-6627', '세바스찬 실시간 전시 구현이 인상적이었습니다. 커피챗 제안드려요.', 'checked', '2026-06-10T16:30:00+09:00'),
    contact('preview-contact-5', idealzip, previewStudents[3], '정우성', '우아한형제들', 'UX 디자이너', 'wooseong.jung@woowahan.com', '010-3318-9942', '이상형.zip 인터랙션 디자인 완성도가 높네요. 작업 과정이 궁금합니다. 연락 부탁드립니다.', 'new', '2026-06-11T13:08:00+09:00'),
    contact('preview-contact-6', workit, previewStudents[4], '윤소희', 'LG CNS', '프로젝트 매니저', 'sohee.yun@lgcns.com', '010-7763-2205', 'WorkIt 백엔드 설계가 탄탄합니다. 사내 멘토링 프로그램 연계를 희망합니다.', 'checked', '2026-06-10T11:17:00+09:00'),
  ];
}

function project(
  id: string,
  serviceName: string,
  teamName: string,
  description: string,
  experienceCategory: string,
  boothSlot: string,
  feedbackCount: number,
  contactCount: number,
  interestCount: number,
): ProjectSummary {
  return {
    id,
    serviceName,
    teamName,
    description,
    thumbnailUrl: null,
    experienceCategory,
    boothSlot,
    acceptsFeedback: true,
    isPublished: true,
    feedbackCount,
    contactCount,
    interestCount,
  };
}

function feedback(
  id: string,
  projectId: string,
  content: string,
  createdAt: string,
  status: FeedbackStatus = 'public',
): Feedback {
  return {
    id,
    projectId,
    visitorProfileId: null,
    ageGroup: createdAt.includes('11T') ? 'adult' : 'youth',
    visitorType: status === 'blocked' ? 'recruiter' : 'general',
    gender: Number(id.replace(/\D/g, '').slice(-1) || 0) % 2 === 0 ? 'female' : 'male',
    content,
    status,
    moderationReason: status === 'blocked' ? '부적절한 내용' : null,
    createdAt,
  };
}

function contact(
  id: string,
  projectItem: ProjectSummary,
  targetStudent: AdminUser,
  name: string,
  organization: string,
  position: string,
  email: string,
  phone: string,
  memo: string,
  status: ContactStatus,
  createdAt: string,
): Contact {
  return {
    id,
    projectId: projectItem.id,
    targetMemberUserId: targetStudent.id,
    targetMemberUser: targetStudent,
    name,
    organization,
    position,
    email,
    phone,
    memo,
    status,
    createdAt,
    project: projectItem,
  };
}
