import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  border: 1px solid #eeeeee;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;

  .header {
    background: #c3e1d2;
    padding: 8.5px 12px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .actions {
    display: flex;
    gap: 20px;

    .action {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

interface SectionProps {
  title: string;
  children: ReactNode;
  onAdd?: () => void;
  onHistory?: () => void;
  disabled?: boolean;
}

export const Section = ({ title, children, onAdd, onHistory, disabled }: SectionProps) => {
  const { t } = useTranslation();
  return (
    <Container>
      <div className="header">
        {title}
        <div className="actions">
          {onAdd && !disabled && (
            <span onClick={onAdd} className="action">
              {t('globaly.lowercase_add')}
            </span>
          )}
          {onHistory && (
            <span onClick={onHistory} className="action">
              {t('globaly.history')}
            </span>
          )}
        </div>
      </div>
      <div>{children}</div>
    </Container>
  );
};
