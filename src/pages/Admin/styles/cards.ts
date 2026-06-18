import styled from 'styled-components';

export const Desk = styled.section`
  display: grid;
  gap: 34px;
`;

export const SearchRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 49px;

  @media (max-width: 900px) {
    flex-direction: column;
    margin-bottom: 0;
  }
`;

export const SearchBox = styled.label`
  width: min(100%, 840px);
  min-height: 60px;
  padding: 0 29px;
  border: 1px solid #d9d9d9;
  border-radius: 49px;
  display: flex;
  align-items: center;
  gap: 18px;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #222222;
  font-size: 16px;

  &::placeholder {
    color: #b9b9b9;
  }
`;

export const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
`;

export const ActionStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;

  @media (max-width: 900px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const TabGroup = styled.nav`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

export const TabButton = styled.button<{ readonly $active: boolean }>`
  min-width: 107px;
  min-height: 46px;
  padding: 0 34px;
  border-radius: 12px;
  background: ${({ $active }) => ($active ? '#e74e5b' : '#f5f5f5')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#000000')};
  font-size: 20px;
  white-space: nowrap;

  @media (max-width: 620px) {
    min-width: 0;
    flex: 1 1 calc(50% - 8px);
    padding: 0 16px;
    font-size: 16px;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    justify-content: stretch;
  }
`;

export const ExportButton = styled.button`
  min-height: 46px;
  padding: 0 24px;
  border: 1px solid #e74e5b;
  border-radius: 12px;
  background: #ffffff;
  color: #e74e5b;
  font-size: 18px;
  white-space: nowrap;

  &:hover {
    background: #fff3f4;
  }

  @media (max-width: 620px) {
    flex: 1 1 100%;
    font-size: 16px;
  }
`;

export const SortSelect = styled.select`
  appearance: none;
  width: auto;
  min-width: 147px;
  height: 50px;
  padding: 0 52px 0 23px;
  border: 1px solid #d9d9d9;
  border-radius: 31px;
  background: #ffffff url('/assets/icons/chevron-down.svg') right 22px center / 18px 18px no-repeat;
  color: #000000;
  font-size: 20px;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

export const ContactGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 336px);
  gap: 18px 20px;

  @media (max-width: 1480px) {
    grid-template-columns: repeat(3, 336px);
  }

  @media (max-width: 1120px) {
    grid-template-columns: repeat(2, minmax(0, 336px));
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const ContactCard = styled.button`
  position: relative;
  min-height: 120px;
  padding: 25px;
  border: 1px solid #d9d9d9;
  border-radius: 24px;
  background: #ffffff;
  text-align: left;
  transition: box-shadow 120ms ease;

  &:hover {
    box-shadow: 0 4px 5.2px rgba(0, 0, 0, 0.15);
  }
`;

export const NewDot = styled.span`
  position: absolute;
  top: 29px;
  right: 29px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e74e5b;
`;

export const Masonry = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 1120px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const FeedbackCard = styled.article`
  display: block;
  width: 100%;
  min-height: 211px;
  margin: 0;
  padding: 25px;
  border: 1px solid #d9d9d9;
  border-radius: 24px;
  background: #ffffff;
`;

export const FeedbackSummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }
`;

export const FeedbackSummaryCard = styled.article`
  min-height: 132px;
  padding: 22px;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  background: #ffffff;
`;

export const FeedbackSummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #222222;

  span {
    font-size: 18px;
    font-weight: 500;
  }

  strong {
    font-size: 26px;
    font-weight: 600;
  }
`;

export const FeedbackSummaryItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
`;

export const FeedbackSummaryItem = styled.div`
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #444444;
  font-size: 14px;

  strong {
    color: #e74e5b;
    font-weight: 600;
  }
`;

export const ProjectChip = styled.span<{ readonly $color: string }>`
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 0 15px;
  border-radius: 25px;
  background: ${({ $color }) => $color};
  color: #222222;
  font-size: 16px;
  line-height: 30px;
`;

export const CardTitle = styled.h2`
  margin-top: 10px;
  color: #222222;
  font-size: 24px;
  line-height: 30px;
  font-weight: 500;
  overflow-wrap: anywhere;
`;

export const ContactOrg = styled.p`
  margin-top: 10px;
  color: #444444;
  font-size: 16px;
  line-height: 30px;
  overflow-wrap: anywhere;
`;

export const CardBody = styled.p`
  margin-top: 20px;
  color: #444444;
  font-size: 16px;
  line-height: 30px;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;

export const FeedbackMetaList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

export const FeedbackMetaChip = styled.span`
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: #f5f5f5;
  color: #555555;
  font-size: 13px;
  line-height: 28px;
`;

export const CardFooter = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  color: #666666;
  font-size: 13px;
`;

export const FeedbackActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MiniDangerButton = styled.button`
  min-height: 32px;
  padding: 0 12px;
  border-radius: 12px;
  background: #fff3f4;
  color: #e74e5b;
`;

export const EmptyState = styled.div`
  min-height: 420px;
  display: grid;
  place-items: center;
  color: #d9d9d9;
  font-size: clamp(22px, 2vw, 32px);
  text-align: center;
`;
