import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';

import { Section } from '../Section';
import { Row } from './Row';
import useQueryCustom from 'hooks/useQueryCustom';
import PermissionGate from 'permissions/PermissionGate';
import { EmployeeDependent, Person } from 'types';
import { Add } from './modals/Add';

interface DependentsProps {
  disabled: boolean;
  person: Person;
}

export const Dependents = ({ disabled, person }: DependentsProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQueryCustom<
    { count: number; list: EmployeeDependent[] },
    { errors: string[] }
  >(
    ['get_employee_dependent', person],
    {
      endpoint: `/employee_dependent?employee_id=${person.id}`,
      options: { method: 'get' },
    },
    { cacheTime: 0, enabled: true }
  );

  const refreshData = () => {
    queryClient.invalidateQueries('get_employee_dependent');
    queryClient.refetchQueries('get_employee_benefit');
  }

  return (
    <PermissionGate action={'edit'} on={'dependent'} shouldVisible properties={{ disabled: true }}>
      <Section disabled={disabled} onAdd={() => setIsOpen(true)} title={t('benefits.dependents')}>
        {isLoading ? (
          <LoadingContainer>
            <CircularProgress size={24} />
          </LoadingContainer>
        ) : !data?.list.length ? (
          <NoData>{t('benefits.dependent.no_data')}</NoData>
        ) : (
          <TableContainer>
            <Table style={{ width: '-webkit-fill-available' }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('benefits.dependent.name')}</TableCell>
                  <TableCell>{t('benefits.dependent.relationship')}</TableCell>
                  <TableCell>{t('benefits.dependent.personal_number')}</TableCell>
                  <TableCell>{t('benefits.dependent.birthdate')}</TableCell>
                  <TableCell>{t('benefits.dependent.age')}</TableCell>
                  <TableCell>{t('benefits.dependent.gender')}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.list.map((item) => (
                  <Row
                    key={item.id}
                    item={item}
                    person={person}
                    refreshData={() => refreshData()}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Add
          person={person}
          isOpen={isOpen}
          onCloseModal={() => setIsOpen(false)}
          refreshData={() => queryClient.invalidateQueries('get_employee_dependent')}
        />
      </Section>
    </PermissionGate>
  );
};

const NoData = styled.div`
  padding: 5px 10px;
  font-size: 11px;
  color: #80888d;
  padding: 15px;
`;

const LoadingContainer = styled.div`
  padding: 15px;
  display: flex;
  justify-content: center;
`;
