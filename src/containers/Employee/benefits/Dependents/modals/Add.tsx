import { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';

import { EmployeeDependent, EmployeeDependentInput, Person } from 'types';
import useMutationCustom from 'hooks/useMutationCustom';
import { FormValues, Modal } from './Modal';

interface AddProps {
  afterSubmit?: (value: EmployeeDependent) => void;
  person: Person;
  isOpen: boolean;
  onCloseModal: () => void;
  refreshData: () => void;
}

export const Add = ({ afterSubmit, person, isOpen, onCloseModal, refreshData }: AddProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    shouldFocusError: false,
    defaultValues: {
      first_name: '',
      last_name: '',
      relationship: null,
      personal_number: '',
      birth_date: null,
      gender: undefined,
    },
  });

  const addDependent = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    EmployeeDependentInput
  >(
    ['add_dependent'],
    {
      endpoint: '/employee_dependent',
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        onCloseModal();
        addToast(
          `${t('globaly.add_success', {
            title: t('benefits.dependent.employee_dependent'),
          })}`,
          {
            appearance: 'success',
            autoDismiss: true,
          }
        );
        afterSubmit?.(data as EmployeeDependent);
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
        const result: EmployeeDependentInput = {
          employee_id: person.id,
          first_name: data.first_name,
          last_name: data.last_name,
          birth_date: data.birth_date!,
          gender: data.gender,
          personal_number: data.personal_number,
          relationship_id: data.relationship!.id,
        };
        addDependent.mutate(result);
      }, onFormError)();
    },
    [addDependent, handleSubmit, person.id]
  );

  return (
    <Modal
      actionLoading={addDependent.isLoading}
      control={control}
      errors={errors}
      handleSubmit={onSubmit}
      person={person}
      isOpen={isOpen}
      register={register}
      title={t('benefits.modal.add_employee_dependent')}
      onCloseModal={() => {
        onCloseModal();
        reset();
      }}
      watch={watch}
    />
  );
};
