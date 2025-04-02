import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import styled from 'styled-components';

import { PaymentDocument as PayDocument, PaymentDocumentStatus } from 'types';
import useMutationCustom from 'hooks/useMutationCustom';
import useQueryCustom from 'hooks/useQueryCustom';
import { Benefits } from './Benefits';
import { Earnings } from './Earnings';
import { Summary } from './Summary';
import { useError } from 'hooks/useError';
import { Footer } from '../components/Footer';
import Steps from 'components/Steps';

const flow: ReactElement[] = [<Earnings />, <Benefits />, <Summary />];

export const RegularPayroll = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToasts();
  const history = useHistory<{ step: number }>();

  const { onError } = useError();

  const [activeStep, setActiveStep] = useState(history.location.state?.step || 1);

  const { data } = useQueryCustom<PayDocument, { errors: string[] }>(
    ['payment_document', id],
    {
      endpoint: `/payment_document/${id}`,
      options: {
        method: 'get',
      },
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const isDraftDocument = data?.payment_document_status.id === PaymentDocumentStatus.DRAFT;

  const { mutate: submitDocument } = useMutationCustom<{}, {}, { id: number }>(
    ['submit_payment_document'],
    {
      endpoint: '/payment_document/approve',
      options: { method: 'post' },
    },
    {
      onSuccess: () => {
        addToast(t('payroll.payment_document.toast.submit'), {
          appearance: 'success',
          autoDismiss: true,
        });
        history.push('/payroll');
      },
      onError,
    }
  );

  return (
    <Container>
      <Wrapper>
        <div>
          <Steps
            activeStep={activeStep}
            items={Object.values<{ title: string }>(
              t('payroll.payment_document.steps', { returnObjects: true })
            ).map((value, index) => ({
              label: value.title,
              step: index + 1,
              title: index + 1,
            }))}
          />
        </div>
        {flow[activeStep - 1]}
      </Wrapper>
      <Footer
        activeStep={activeStep}
        flowLength={flow.length}
        onClose={() => history.push('/payroll')}
        onSubmit={isDraftDocument ? () => submitDocument({ id: Number(id) }) : undefined}
        setActiveStep={setActiveStep}
      />
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  padding: 25px 30px 10px 0;
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
`;
