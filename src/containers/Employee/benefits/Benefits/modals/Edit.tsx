import { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';

import { EmployeeBenefit, EmployeeBenefitInput, Person } from 'types';
import { FormValues, Modal } from './Modal';
import useMutationCustom from 'hooks/useMutationCustom';

interface EditProps {
  item: EmployeeBenefit;
  person: Person;
  onCloseModal: () => void;
  refreshData: () => void;
}

export const Edit = ({ item, person, onCloseModal, refreshData }: EditProps) => {
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
      benefit: item.benefit,
      participants: item.participants,
      completion_reason: item.benefit_completion_reason,
      start_on: utcToZonedTime(new Date(item.start_on), 'UTC'),
      end_on: item.end_on ? utcToZonedTime(new Date(item.end_on), 'UTC') : undefined,
    },
  });

  const editBenefit = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    EmployeeBenefitInput
  >(
    ['edit_benefit'],
    {
      endpoint: `/employee_benefit/${item.id}`,
      options: { method: 'put' },
    },
    {
      onSuccess: () => {
        onCloseModal();
        addToast(
          `${t('globaly.update_success', {
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
          end_on: data.end_on || null,
          benefit_id: data.benefit!.id,
          benefit_completion_reason_id: !data.end_on ? null : data.completion_reason!.id,
          participant_ids: data.participants!.map((participant) => participant.id),
        };
        editBenefit.mutate(result);
      }, onFormError)();
    },
    [editBenefit, handleSubmit, person.id]
  );

  return (
    <Modal
      actionLoading={editBenefit.isLoading}
      control={control}
      errors={errors}
      handleSubmit={onSubmit}
      person={person}
      isOpen={true}
      register={register}
      title={t('benefits.modal.edit_employee_benefit')}
      onCloseModal={onCloseModal}
      watch={watch}
      setValue={setValue}
      getValues={getValues}
    />
  );
};
