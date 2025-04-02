import React, { useCallback } from 'react';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import styled from 'styled-components';

import { ErrorMessage, ErrorPayload } from 'types';

const areBaseErrors = (err: unknown): err is ErrorPayload => {
  return (
    !!err &&
    typeof err === 'object' &&
    Object.prototype.hasOwnProperty.call(err, 'errors') &&
    Object.prototype.hasOwnProperty.call(err, 'status') &&
    Array.isArray((err as ErrorPayload).errors) &&
    (err as ErrorPayload).errors.every(
      (element) =>
        !!element &&
        typeof element === 'object' &&
        Object.prototype.hasOwnProperty.call(element, 'message')
    )
  );
};

const areFormErrors = (errors: Array<ErrorMessage>): errors is Array<Required<ErrorMessage>> => {
  return errors.every((element) => Object.prototype.hasOwnProperty.call(element, 'field'));
};

// expected errors come with status code 4**
const expectedErrorStatusRegex = /^4[0-9]{2}$/;

type useErrorProps<T extends FieldValues = FieldValues> = {
  setError?: UseFormSetError<T>;
};

export const useError = <T extends FieldValues = FieldValues>({
  setError,
}: useErrorProps<T> = {}) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const onError = useCallback(
    (err: unknown) => {
      if (areBaseErrors(err)) {
        const errors = err.errors;
        const status = err.status.toString();
        if (areFormErrors(errors) && setError) {
          errors.forEach((item) => {
            setError(item.field as Path<T>, { type: item.type || 'custom', message: item.message });
          });
        } else if (status.match(expectedErrorStatusRegex)) {
          addToast(errors[0].message, {
            appearance: 'error',
            autoDismiss: true,
          });
        } else {
          addToast(
            <ToastContainer>
              <span>{t('globaly.oops')}</span>
              <span>{errors[0].message}</span>
            </ToastContainer>,
            {
              appearance: 'error',
              autoDismiss: true,
            }
          );
        }
      } else {
        addToast(t('globaly.oops'), {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    },
    [addToast, setError, t]
  );

  return {
    onError,
  };
};

const ToastContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
