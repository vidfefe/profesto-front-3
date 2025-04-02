import { useCallback, useEffect, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldErrorsImpl,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import styled from 'styled-components';

import DatePicker from 'components/DatePickers/DatePicker';
import EnumDropdown from 'components/Dropdowns/EnumDropdown';
import UniversalInput from 'components/Input/UniversalInput';
import PersonalNumber from 'components/PersonalNumber';
import EmpEditHeader from 'containers/Employee/editHeader';
import DialogModal from 'components/Modal/Dialog';
import { createRelationship, getEnum, getRelationshipList } from 'services';
import { calculateAge } from 'utils/common';
import { Person, Relationship } from 'types';
import SelectWithAdd from 'components/Dropdowns/SelectWithAdd';

export type FormValues = {
  first_name: string;
  last_name: string;
  relationship: Relationship | null;
  personal_number: string;
  birth_date: Date | null;
  gender?: string;
};

interface ModalProps {
  actionLoading: boolean;
  control: Control<FormValues, any>;
  errors: Partial<FieldErrorsImpl<FormValues>>;
  handleSubmit: (onFormError: (err: FieldErrors<FormValues>) => void) => void;
  person: Person;
  isOpen: boolean;
  register: UseFormRegister<FormValues>;
  title: string;
  onCloseModal: () => void;
  watch: UseFormWatch<FormValues>;
}

export const Modal = ({
  actionLoading,
  control,
  errors,
  handleSubmit,
  person,
  isOpen,
  register,
  title,
  onCloseModal,
  watch,
}: ModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const [loading, setLoading] = useState(false);
  const [genders, setGenders] = useState([]);

  const watchPersonalNumber = watch('personal_number');

  useEffect(() => {
    setLoading(true);
    getEnum('Enum::Gender')
      .then((response) => setGenders(response.data))
      .finally(() => setLoading(false));
  }, []);

  const onFormError = useCallback(
    (err: FieldErrors<FormValues>) => {
      if (err) {
        addToast(
          <ToastContentContainer
            dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted') }}
          />,
          {
            appearance: 'error',
            autoDismiss: true,
            placement: 'top-center',
          }
        );
      }
    },
    [addToast, t]
  );

  return (
    <DialogModal
      open={isOpen}
      onClose={onCloseModal}
      title={title}
      hideActionButton={loading}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionButton={() => handleSubmit(onFormError)}
      actionLoading={actionLoading}
      fullWidth
      nominalHeader={
        <EmpEditHeader
          employeeName={`${person.first_name} ${person.last_name}`}
          avatarUuid={person.uuid}
          employeeId={person.id}
          jobData={person.active_job_detail}
        />
      }
    >
      {loading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : (
        <>
          <FlexRow>
            <StyledFieldItem>
              <UniversalInput
                label={t('employee.first_name')}
                required
                placeholder={t('components.input.placeholder', { field: t('employee.first_name') })}
                errorText={errors.first_name ? errors.first_name.message : ''}
                {...register('first_name', {
                  required: t('validations.is_required', { attribute: t('employee.first_name') }),
                  maxLength: {
                    value: 150,
                    message: t('validations.value_must_be_less_than', {
                      name: t('employee.first_name'),
                      maxLength: 150,
                    }),
                  },
                })}
              />
            </StyledFieldItem>
            <StyledFieldItem>
              <UniversalInput
                label={t('employee.last_name')}
                required
                placeholder={t('components.input.placeholder', { field: t('employee.last_name') })}
                errorText={errors.last_name ? errors.last_name.message : ''}
                {...register('last_name', {
                  required: t('validations.is_required', { attribute: t('employee.last_name') }),
                  maxLength: {
                    value: 150,
                    message: t('validations.value_must_be_less_than', {
                      name: t('employee.last_name'),
                      maxLength: 150,
                    }),
                  },
                })}
              />
            </StyledFieldItem>
          </FlexRow>
          <StyledFieldItem>
            <label>
              {t('benefits.dependent.relationship')}
              <sup>*</sup>
            </label>
            <Controller
              name={'relationship'}
              control={control}
              rules={{
                required: t('validations.is_required', {
                  attribute: t('benefits.dependent.relationship'),
                }),
              }}
              render={({ field: { onChange, value } }) => (
                <SelectWithAdd
                  inputPlaceholder={t('components.select.placeholder', {
                    field: t('benefits.dependent.relationship'),
                  })}
                  name={t('benefits.dependent.relationship')}
                  inputValue={value}
                  loadRemoteData={() => getRelationshipList(100, 1)}
                  createRequest={createRelationship}
                  errorText={errors.relationship ? errors.relationship.message : ''}
                  onChange={onChange}
                />
              )}
            />
          </StyledFieldItem>
          <StyledFieldItem data-half-row={true}>
            <PersonalNumber
              labelStyle={{ display: 'inline-block', marginBottom: 6 }}
              control={control}
              errors={errors}
              showRemoveMark={false}
              watchPersonalNumber={watchPersonalNumber}
              placeholder={t('components.input.placeholder', {
                field: t('benefits.dependent.personal_number'),
              })}
              {...register('personal_number', {
                required: t('validations.is_required', {
                  attribute: t('benefits.dependent.personal_number'),
                }),
              })}
            />
          </StyledFieldItem>
          <StyledFieldItem>
            <Controller
              name={'birth_date'}
              control={control}
              rules={{
                required: t('validations.is_required', {
                  attribute: t('benefits.dependent.birthdate'),
                }),
              }}
              render={({ field: { onChange, value } }) => (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <DatePickerContainer>
                    <DatePicker
                      label={t('benefits.dependent.birthdate')}
                      required
                      selected={value}
                      onChange={onChange}
                      maxDate={new Date()}
                      errorText={errors.birth_date ? errors.birth_date.message : ''}
                    />
                  </DatePickerContainer>
                  <div style={{ margin: '0 0 13px 13px' }}>
                    {value && `(${t('benefits.dependent.age')}: ${calculateAge(value)})`}
                  </div>
                </div>
              )}
            />
          </StyledFieldItem>
          <StyledFieldItem data-half-row={true}>
            <label>{t('benefits.dependent.gender')}</label>
            <Controller
              name={'gender'}
              control={control}
              render={({ field: { onChange, value } }) => (
                <EnumDropdown
                  placeholder={t('components.select.placeholder', {
                    field: t('benefits.dependent.gender'),
                  })}
                  onChange={onChange}
                  errorText={errors.gender ? errors.gender.message : ''}
                  value={value}
                  options={genders}
                />
              )}
            />
          </StyledFieldItem>
        </>
      )}
    </DialogModal>
  );
};

const StyledFieldItem = styled.div`
  margin-bottom: 16px;
  & sup {
    color: #c54343;
  }
  & > label {
    display: inline-block;
    margin-bottom: 6px;
  }
  &[data-half-row='true'] {
    width: 50%;
    @media (max-width: 500px) {
      width: 100%;
    }
  }
`;

const FlexRow = styled.div`
  display: flex;
  gap: 10px;
  & > div {
    flex: 1;
  }
  @media (max-width: 500px) {
    gap: 0;
    flex-direction: column;
  }
`;

const ToastContentContainer = styled.div`
  & > b {
    font-family: 'Aspira Demi', 'FiraGO Regular';
  }
`;

const DatePickerContainer = styled.div`
  width: 50%;
  @media (max-width: 500px) {
    width: calc(100% - 65px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
`;
