import { useCallback, useMemo, useState } from 'react';
import {
  fetchContactDetail,
  updateContactStatus,
  type AdminSnapshot,
  type Contact,
  type ProjectSummary,
} from '../../../api/adminApi';
import { CLASS_FILTERS, STAFF_VIEW_LABELS, sortByDate, type SortKey, type StaffViewKey } from '../adminTypes';
import { downloadContactsCsv } from '../contactExport';
import {
  contactGroupKey,
  filterContacts,
  filterContactsByClass,
  groupContactsByTargetStudent,
  groupSummary,
  studentDisplayName,
  type ContactGroup,
} from '../contactListUtils';
import { AdminManagement } from './AdminManagement';
import { ContactDetail } from './ContactDetail';
import { FeedbackAudienceSummary, FeedbackList } from './FeedbackList';
import * as S from '../AdminDashboard.styled';

type StaffDashboardProps = {
  readonly snapshot: AdminSnapshot;
  readonly view: StaffViewKey;
  readonly setView: (view: StaffViewKey) => void;
  readonly sort: SortKey;
  readonly setSort: (sort: SortKey) => void;
  readonly token: string;
  readonly refresh: () => Promise<void>;
  readonly isPreview?: boolean;
};

export function StaffDashboard({ snapshot, view, setView, sort, setSort, token, refresh, isPreview = false }: StaffDashboardProps) {
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('전체');
  const [feedbackProjectId, setFeedbackProjectId] = useState('all');
  const [checkedContactIds, setCheckedContactIds] = useState<ReadonlySet<string>>(() => new Set());
  const [contactDetails, setContactDetails] = useState<Readonly<Record<string, Contact>>>({});
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const projectsById = useMemo(() => new Map(snapshot.projects.items.map((project) => [project.id, project])), [snapshot.projects.items]);
  const displayedContacts = useMemo(
    () => snapshot.contacts.items.map((contact) => (checkedContactIds.has(contact.id) ? { ...contact, status: 'checked' as const } : contact)),
    [checkedContactIds, snapshot.contacts.items],
  );
  const contacts = sortByDate(
    filterContactsByClass(filterContacts(displayedContacts, projectsById, query), classFilter),
    sort,
  );
  const contactGroups = useMemo(() => groupContactsByTargetStudent(contacts), [contacts]);
  const selectedContactFallback = selectedContactId ? contacts.find((contact) => contact.id === selectedContactId) : null;
  const selectedGroupKey = selectedContactFallback ? contactGroupKey(selectedContactFallback) : null;
  const selectedGroup = selectedGroupKey ? contactGroups.find((group) => group.key === selectedGroupKey) : null;
  const selectedIndex = selectedContactId && selectedGroup
    ? selectedGroup.contacts.findIndex((contact) => contact.id === selectedContactId)
    : -1;
  const selectedContact = selectedIndex >= 0 && selectedContactId
    ? contactDetails[selectedContactId] ?? selectedGroup?.contacts[selectedIndex] ?? null
    : null;
  const feedback = sortByDate(
    snapshot.feedback.items
      .filter((item) => feedbackProjectId === 'all' || item.projectId === feedbackProjectId)
      .map((item) => ({ ...item, project: projectsById.get(item.projectId) })),
    sort,
  );

  const markContactChecked = useCallback((contact: Contact) => {
    setCheckedContactIds((ids) => new Set(ids).add(contact.id));
    setContactDetails((details) => ({ ...details, [contact.id]: { ...contact, status: 'checked' } }));
  }, []);

  const openContact = useCallback(async (contact: Contact) => {
    setSelectedContactId(contact.id);
    if (isPreview) {
      if (contact.status === 'new') {
        markContactChecked(contact);
        return;
      }
      setContactDetails((details) => ({ ...details, [contact.id]: contact }));
      return;
    }
    const detail = await fetchContactDetail(token, contact.id).catch(() => contact);
    setContactDetails((details) => ({ ...details, [contact.id]: detail }));
    if (contact.status === 'new') {
      const checked = await updateContactStatus(token, contact.id, 'checked').catch(() => null);
      if (checked) markContactChecked(checked);
    }
  }, [isPreview, markContactChecked, token]);

  const openContactAtGroupIndex = useCallback((index: number) => {
    const contact = selectedGroup?.contacts[index];
    if (!contact) return;
    void openContact(contact);
  }, [openContact, selectedGroup?.contacts]);

  const moveContact = useCallback((direction: -1 | 1) => {
    const groupContacts = selectedGroup?.contacts ?? [];
    if (selectedIndex < 0 || groupContacts.length === 0) return;
    const nextIndex = (selectedIndex + direction + groupContacts.length) % groupContacts.length;
    const contact = groupContacts[nextIndex];
    if (!contact) return;
    void openContact(contact);
  }, [openContact, selectedGroup?.contacts, selectedIndex]);
  const downloadContacts = useCallback(() => {
    downloadContactsCsv(contacts, projectsById, classFilter);
  }, [classFilter, contacts, projectsById]);

  if (selectedContact) {
    return (
      <S.Content>
        <ContactDetail
          contact={selectedContact}
          project={projectsById.get(selectedContact.projectId)}
          currentIndex={selectedIndex}
          totalCount={selectedGroup?.contacts.length ?? 1}
          onBack={() => setSelectedContactId(null)}
          onMove={moveContact}
          onSelectIndex={openContactAtGroupIndex}
        />
      </S.Content>
    );
  }

  return (
    <S.Content>
      <S.Desk>
        <S.SearchRow>
          <S.SearchBox>
            <S.SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="학생의 이름 혹은 학번을 검색하세요" />
            <S.SearchIcon src="/assets/icons/search.svg" alt="" aria-hidden="true" />
          </S.SearchBox>
          <S.SortSelect value={sort} onChange={(event) => setSort(event.target.value as SortKey)} aria-label="정렬">
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </S.SortSelect>
        </S.SearchRow>
        <S.ActionStrip>
          {view === 'contacts' ? (
            <S.TabGroup aria-label="반 필터">
              {CLASS_FILTERS.map((label) => (
                <S.TabButton key={label} type="button" $active={classFilter === label} onClick={() => setClassFilter(label)}>
                  {label}
                </S.TabButton>
              ))}
            </S.TabGroup>
          ) : (
            <S.TabGroup aria-label="팀 필터">
              <S.TabButton type="button" $active={feedbackProjectId === 'all'} onClick={() => setFeedbackProjectId('all')}>
                전체
              </S.TabButton>
              {snapshot.projects.items.map((project) => (
                <S.TabButton
                  key={project.id}
                  type="button"
                  $active={feedbackProjectId === project.id}
                  onClick={() => setFeedbackProjectId(project.id)}
                >
                  {project.serviceName}
                </S.TabButton>
              ))}
            </S.TabGroup>
          )}
          <S.ActionButtons>
            {view === 'contacts' ? (
              <S.ExportButton type="button" onClick={downloadContacts}>
                엑셀 다운로드
              </S.ExportButton>
            ) : null}
            <ModeSwitch view={view} setView={setView} />
          </S.ActionButtons>
        </S.ActionStrip>
        {view === 'contacts' ? (
          <ContactList
            groups={contactGroups}
            projectsById={projectsById}
            onSelect={openContact}
          />
        ) : (
          <>
            <FeedbackAudienceSummary feedback={feedback} />
            <FeedbackList feedback={feedback} token={token} canModerate isPreview={isPreview} />
          </>
        )}
        {snapshot.user.role === 'admin' ? <AdminManagement snapshot={snapshot} token={token} onChanged={refresh} isPreview={isPreview} /> : null}
      </S.Desk>
    </S.Content>
  );
}

function ModeSwitch({ view, setView }: { readonly view: StaffViewKey; readonly setView: (view: StaffViewKey) => void }) {
  return (
    <S.TabGroup aria-label="관리 보기">
      {(Object.keys(STAFF_VIEW_LABELS) as StaffViewKey[]).map((key) => (
        <S.TabButton key={key} type="button" $active={view === key} onClick={() => setView(key)}>
          {STAFF_VIEW_LABELS[key]}
        </S.TabButton>
      ))}
    </S.TabGroup>
  );
}

function ContactList({
  groups,
  projectsById,
  onSelect,
}: {
  readonly groups: readonly ContactGroup[];
  readonly projectsById: ReadonlyMap<string, ProjectSummary>;
  readonly onSelect: (contact: Contact) => void;
}) {
  if (groups.length === 0) return <S.EmptyState>아직 채용을 희망하는 회사가 없습니다</S.EmptyState>;
  return (
    <S.ContactGrid>
      {groups.map((group) => (
        <S.ContactCard
          key={group.key}
          type="button"
          onClick={() => onSelect(group.contacts[0])}
        >
          <S.CardTitle>{studentDisplayName(group.contacts[0])}</S.CardTitle>
          <S.ContactOrg>{groupSummary(group.contacts, projectsById)}</S.ContactOrg>
          {group.contacts.some((contact) => contact.status === 'new') ? <S.NewDot /> : null}
        </S.ContactCard>
      ))}
    </S.ContactGrid>
  );
}
