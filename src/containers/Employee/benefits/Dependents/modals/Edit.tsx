import { useCallback } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';

import { EmployeeDependent, EmployeeDependentInput, Person } from 'types';
import useMutationCustom from 'hooks/useMutationCustom';
import { FormValues, Modal } from './Modal';

interface EditProps {
  person: Person;
  item: EmployeeDependent;
  onCloseModal: () => void;
  refreshData: () => void;
}

export const Edit = ({ person, item, onCloseModal, refreshData }: EditProps) => {
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
      first_name: item.first_name,
      last_name: item.last_name,
      relationship: item.relationship,
      personal_number: item.personal_number,
      birth_date: utcToZonedTime(new Date(item.birth_date), 'UTC'),
      gender: item.gender?.id,
    },
  });

  const editDependent = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    EmployeeDependentInput
  >(
    ['edit_dependent'],
    {
      endpoint: `/employee_dependent/${item.id}`,
      options: { method: 'put' },
    },
    {
      onSuccess: () => {
        onCloseModal();
        addToast(
          `${t('globaly.update_success', {
            title: t('benefits.dependent.employee_dependent'),
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
        const result: EmployeeDependentInput = {
          employee_id: person.id,
          first_name: data.first_name,
          last_name: data.last_name,
          birth_date: data.birth_date!,
          gender: data.gender,
          personal_number: data.personal_number,
          relationship_id: data.relationship!.id,
        };
        editDependent.mutate(result);
      }, onFormError)();
    },
    [editDependent, handleSubmit, person.id]
  );

  return (
    <Modal
      actionLoading={editDependent.isLoading}
      control={control}
      errors={errors}
      handleSubmit={onSubmit}
      person={person}
      isOpen={true}
      register={register}
      title={t('benefits.modal.edit_employee_dependent')}
      onCloseModal={onCloseModal}
      watch={watch}
    />
  );
};
