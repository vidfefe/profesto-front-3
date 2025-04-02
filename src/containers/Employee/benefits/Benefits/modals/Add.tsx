import { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { useToasts } from 'react-toast-notifications';
import { useTranslation } from 'react-i18next';

import { EmployeeBenefitInput, Person } from 'types';
import { FormValues, Modal } from './Modal';
import useMutationCustom from 'hooks/useMutationCustom';

interface AddProps {
  person: Person;
  isOpen: boolean;
  onCloseModal: () => void;
  refreshData: () => void;
}

export const Add = ({ person, isOpen, onCloseModal, refreshData }: AddProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<FormValues>({
    shouldFocusError: false,
    defaultValues: {
      benefit: null,
      participants: [],
      completion_reason: undefined,
      start_on: undefined,
      end_on: undefined,
    },
  });

  const addBenefit = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    EmployeeBenefitInput
  >(
    ['add_benefit'],
    {
      endpoint: `/employee_benefit`,
      options: { method: 'post' },
    },
    {
      onSuccess: () => {
        onCloseModal();
        addToast(
          `${t('globaly.add_success', {
            title: t('benefits.benefit.employee_benefit'),
          })}`,
          {
            appearance: 'success',
            autoDismiss: true,
          }
        );
        reset();
        refreshData();
      },
      onError: (err) => {
        if (err?.errors[0].field) {
          err.errors.forEach((item: any) => {
            setError(item.field, { type: 'custom', message: item.message });
          });
        }
      },
    }
  );

  const onSubmit = useCallback(
    (onFormError: (err: FieldErrors<FormValues>) => void) => {
      handleSubmit((data) => {
        const result: EmployeeBenefitInput = {
          employee_id: person.id,
          start_on: data.start_on!,
          end_on: data.end_on || undefined,
          benefit_id: data.benefit!.id,
          benefit_completion_reason_id: !data.end_on ? undefined : data.completion_reason!.id,
          participant_ids: data.participants!.map((participant) => participant.id),
        };
        addBenefit.mutate(result);
      }, onFormError)();
    },
    [addBenefit, handleSubmit, person.id]
  );

  return (
    <Modal
      actionLoading={addBenefit.isLoading}
      control={control}
      errors={errors}
      handleSubmit={onSubmit}
      person={person}
      isOpen={isOpen}
      register={register}
      title={t('benefits.modal.add_employee_benefit')}
      onCloseModal={() => {
        onCloseModal();
        reset();
      }}
      watch={watch}
      setValue={setValue}
      getValues={getValues}
    />
  );
};
