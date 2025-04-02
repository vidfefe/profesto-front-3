import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';

import PermissionGate from 'permissions/PermissionGate';
import { EmployeeBenefit, Person } from 'types';
import { Section } from '../Section';
import useQueryCustom from 'hooks/useQueryCustom';
import { Add } from './modals';
import { Benefit } from './Benefit';
import { BenefitsHistory } from './BenefitsHistory';

interface BenefitsProps {
  person: Person;
  disabled: boolean;
}

export const Benefits = ({ person, disabled }: BenefitsProps) => {
  const { t } = useTranslation();

  const { data, isLoading, refetch } = useQueryCustom<
    { count: number; list: EmployeeBenefit[] },
    { errors: string[] }
  >(
    ['get_employee_benefit', person],
    {
      endpoint: `/employee_benefit/active?employee_id=${person.id}`,
      options: { method: 'get' },
    },
    { cacheTime: 0, enabled: true }
  );

  const {
    data: history,
    isLoading: loading,
    refetch: refetchHistory,
  } = useQueryCustom<{ count: number; list: EmployeeBenefit[] }, { errors: string[] }>(
    ['get_employee_benefit_history', person],
    {
      endpoint: `/employee_benefit?employee_id=${person.id}`,
      options: { method: 'get' },
    },
    { cacheTime: 0, enabled: true }
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (isHistoryOpen) {
      refetchHistory();
    }
  }, [isHistoryOpen]);

  return (
    <PermissionGate action={'edit'} on={'dependent'} shouldVisible properties={{ disabled: true }}>
      <Section
        title={t('benefits.benefits')}
        onAdd={() => setIsOpen(true)}
        onHistory={history?.count ? () => setIsHistoryOpen(true) : undefined}
        disabled={disabled}
      >
        <div style={{ padding: 15 }}>
          {isLoading ? (
            <LoadingContainer>
              <CircularProgress size={24} />
            </LoadingContainer>
          ) : !data?.list.length ? (
            <NoData>{t('benefits.benefit.no_data')}</NoData>
          ) : (
            <Container>
              {data.list.map((item) => (
                <Benefit
                  disabled={disabled}
                  key={item.id}
                  item={item}
                  person={person}
                  refreshData={() => {
                    refetch().then((res) => {
                      if (!res.data?.count) {
                        refetchHistory();
                      }
                    });
                  }}
                />
              ))}
            </Container>
          )}
          <Add
            person={person}
            isOpen={isOpen}
            onCloseModal={() => setIsOpen(false)}
            refreshData={() => {
              refetchHistory();
              refetch();
            }}
          />
          <BenefitsHistory
            history={history?.list}
            loading={loading}
            addBenefit={() => setIsOpen(true)}
            disabled={disabled}
            isOpen={isHistoryOpen}
            onModalClose={() => setIsHistoryOpen(false)}
            person={person}
            refreshData={() => {
              refetchHistory();
              refetch();
            }}
          />
        </div>
      </Section>
    </PermissionGate>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NoData = styled.div`
  font-size: 11px;
  color: #80888d;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
`;
