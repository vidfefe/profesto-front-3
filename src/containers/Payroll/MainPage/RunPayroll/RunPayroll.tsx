import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Link as MUILink } from '@mui/material';
import styled from 'styled-components';

import { AdvancePaymentModal } from './AdvancePaymentModal';
import { Section } from 'containers/Payroll/components/Section';
import { RegularPayrollModal } from './RegularPayrollModal';

export const RunPayroll = () => {
  const { t } = useTranslation();

  const [openRegularModal, setOpenRegularModal] = useState(false);
  const [openAdvanceModal, setOpenAdvanceModal] = useState(false);

  return (
    <Section title={t('payroll.run_payroll')}>
      <>
        <Container>
          <Action fullWidth variant={'contained'} onClick={() => setOpenRegularModal(true)}>
            {t('payroll.run_block.run_regular_payroll_action')}
          </Action>
          <Link onClick={() => setOpenAdvanceModal(true)}>
            {t('payroll.run_block.advance_payment')}
          </Link>
          <Link>{t('payroll.run_block.assign_additional_earnings')}</Link>
          <Link>{t('payroll.run_block.assign_additional_deductions')}</Link>
        </Container>
        {openRegularModal && <RegularPayrollModal onClose={() => setOpenRegularModal(false)} />}
        {openAdvanceModal && <AdvancePaymentModal onClose={() => setOpenAdvanceModal(false)} />}
      </>
    </Section>
  );
};

const Link = styled(MUILink)`
  color: var(--orange);
  text-decoration-color: var(--orange);
  font-size: 12px;
  font-family: 'Aspira', 'FiraGO';
  cursor: pointer;
`;

const Action = styled(Button)`
  height: 36px;
  background-color: #339966 !important;
  font-family: 'Aspira Wide Demi', 'FiraGO Medium';
  font-size: 11.5px;
  font-feature-settings: 'case';
  padding-bottom: 4px;
  &:hover {
    background-color: #236b47 !important;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 25px;
`;
