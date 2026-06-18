import { useMemo, useState } from 'react';
import { deleteFeedback, updateFeedbackStatus, type Feedback, type FeedbackStatus, type ProjectSummary } from '../../../api/adminApi';
import { formatDate, projectColor } from '../adminTypes';
import * as S from '../AdminDashboard.styled';

type FeedbackWithProject = Feedback & { readonly project?: ProjectSummary };

type FeedbackListProps = {
  readonly feedback: readonly FeedbackWithProject[];
  readonly token?: string;
  readonly canModerate?: boolean;
  readonly isPreview?: boolean;
};

const AGE_LABELS: Record<string, string> = {
  child: '어린이',
  youth: '청소년',
  adult: '성인',
  senior: '경로',
  middle_school: '중학생',
  high_school: '고등학생',
  university: '대학생',
  other: '기타',
};

const GENDER_LABELS: Record<string, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
};

const VISITOR_TYPE_LABELS: Record<string, string> = {
  general: '관람',
  recruiter: '채용',
};

export function FeedbackList({ feedback, token = '', canModerate = false, isPreview = false }: FeedbackListProps) {
  const [statusById, setStatusById] = useState<Record<string, FeedbackStatus | undefined>>({});
  const [pendingById, setPendingById] = useState<Record<string, boolean | undefined>>({});
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<string>>(() => new Set());
  const visibleFeedback = feedback.filter((item) => !deletedIds.has(item.id) && (statusById[item.id] ?? item.status) !== 'deleted');

  if (visibleFeedback.length === 0) return <S.EmptyState>아직 받은 피드백이 없습니다</S.EmptyState>;
  return (
    <S.Masonry>
      {visibleFeedback.map((item) => {
        const status = statusById[item.id] ?? item.status;
        const nextStatus = status === 'public' ? 'blocked' : 'public';
        return (
          <S.FeedbackCard key={item.id}>
            <S.ProjectChip $color={projectColor(item.project)}>{item.project?.serviceName ?? 'Project'}</S.ProjectChip>
            <S.CardTitle>{item.project?.teamName ?? item.project?.boothSlot ?? '기똥찬 라이언'}</S.CardTitle>
            <S.CardBody>{item.content}</S.CardBody>
            <S.FeedbackAudienceLine>
              <S.FeedbackAudienceLabel>보낸 사람</S.FeedbackAudienceLabel>
              <span>{formatFeedbackAudience(item)}</span>
            </S.FeedbackAudienceLine>
            <S.CardFooter>
              <span>{formatDate(item.createdAt)}</span>
              {canModerate ? (
                <S.FeedbackActions>
                  <S.MiniButton
                    type="button"
                    disabled={Boolean(pendingById[item.id])}
                    onClick={async () => {
                      if (isPreview) {
                        setStatusById((previous) => ({ ...previous, [item.id]: nextStatus }));
                        return;
                      }
                      setPendingById((previous) => ({ ...previous, [item.id]: true }));
                      try {
                        const updated = await updateFeedbackStatus(token, item.id, nextStatus);
                        setStatusById((previous) => ({ ...previous, [item.id]: updated.status }));
                      } finally {
                        setPendingById((previous) => ({ ...previous, [item.id]: false }));
                      }
                    }}
                  >
                    {status === 'public' ? '숨김' : '공개'}
                  </S.MiniButton>
                  <S.MiniDangerButton
                    type="button"
                    disabled={Boolean(pendingById[item.id])}
                    onClick={async () => {
                      if (isPreview) {
                        setDeletedIds((previous) => new Set(previous).add(item.id));
                        return;
                      }
                      setPendingById((previous) => ({ ...previous, [item.id]: true }));
                      try {
                        await deleteFeedback(token, item.id);
                        setDeletedIds((previous) => new Set(previous).add(item.id));
                      } finally {
                        setPendingById((previous) => ({ ...previous, [item.id]: false }));
                      }
                    }}
                  >
                    삭제
                  </S.MiniDangerButton>
                </S.FeedbackActions>
              ) : null}
            </S.CardFooter>
          </S.FeedbackCard>
        );
      })}
    </S.Masonry>
  );
}

export function FeedbackAudienceSummary({ feedback }: { readonly feedback: readonly FeedbackWithProject[] }) {
  const visibleFeedback = useMemo(() => feedback.filter((item) => item.status !== 'deleted'), [feedback]);
  const total = visibleFeedback.length;
  if (total === 0) return null;
  return (
    <S.FeedbackSummaryGrid>
      <FeedbackSummaryCard title="성별" total={total} counts={countBy(visibleFeedback, 'gender')} labels={GENDER_LABELS} order={['male', 'female', 'other']} />
      <FeedbackSummaryCard title="나이대" total={total} counts={countBy(visibleFeedback, 'ageGroup')} labels={AGE_LABELS} order={['child', 'youth', 'adult', 'senior', 'middle_school', 'high_school', 'university', 'other']} />
      <FeedbackSummaryCard title="방문 목적" total={total} counts={countBy(visibleFeedback, 'visitorType')} labels={VISITOR_TYPE_LABELS} order={['general', 'recruiter']} />
    </S.FeedbackSummaryGrid>
  );
}

function FeedbackSummaryCard({
  title,
  total,
  counts,
  labels,
  order,
}: {
  readonly title: string;
  readonly total: number;
  readonly counts: ReadonlyMap<string, number>;
  readonly labels: Record<string, string>;
  readonly order: readonly string[];
}) {
  const rows = orderedBreakdown(counts, labels, order);
  return (
    <S.FeedbackSummaryCard>
      <S.FeedbackSummaryHeader>
        <span>{title}</span>
        <strong>{total}</strong>
      </S.FeedbackSummaryHeader>
      <S.FeedbackSummaryItems>
        {rows.map(({ key, label, count }) => (
          <S.FeedbackSummaryItem key={key}>
            <span>{label}</span>
            <strong>{count}</strong>
          </S.FeedbackSummaryItem>
        ))}
      </S.FeedbackSummaryItems>
    </S.FeedbackSummaryCard>
  );
}

function countBy(feedback: readonly FeedbackWithProject[], field: 'ageGroup' | 'gender' | 'visitorType'): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const item of feedback) {
    const key = item[field] || 'unknown';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function orderedBreakdown(counts: ReadonlyMap<string, number>, labels: Record<string, string>, order: readonly string[]) {
  const keys = [...order, ...[...counts.keys()].filter((key) => !order.includes(key))];
  return keys
    .filter((key) => counts.has(key))
    .map((key) => ({
      key,
      label: formatFeedbackMeta(key === 'unknown' ? null : key, labels),
      count: counts.get(key) ?? 0,
    }));
}

function formatFeedbackMeta(value: string | null, labels: Record<string, string>): string {
  if (!value) return '미응답';
  return labels[value] ?? value;
}

function formatFeedbackAudience(feedback: FeedbackWithProject): string {
  const gender = formatFeedbackMeta(feedback.gender, GENDER_LABELS);
  const ageGroup = formatFeedbackMeta(feedback.ageGroup, AGE_LABELS);
  const purpose = feedback.visitorType
    ? `${formatFeedbackMeta(feedback.visitorType, VISITOR_TYPE_LABELS)} 목적`
    : '목적 미응답';
  return `${gender} · ${ageGroup} · ${purpose}`;
}
