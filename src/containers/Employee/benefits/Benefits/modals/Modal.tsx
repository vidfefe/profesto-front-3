import { CSSProperties, useCallback, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldErrorsImpl,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';

import DatePicker from 'components/DatePickers/DatePicker';
import DialogModal from 'components/Modal/Dialog';
import EmpEditHeader from 'containers/Employee/editHeader';
import { getBenefitCompletionReasons, getBenefits, getEmployeeDependents } from 'services';
import { Benefit, BenefitCompletionReason, EmployeeDependent, Person } from 'types';
import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import { Add } from '../../Dependents/modals';
import { BenefitModal } from 'containers/Settings/Dictionaries/Benefits/BenefitModal';
import { Multiselect } from 'components/Multiselect';

export type FormValues = {
  benefit: Benefit | null;
  participants: EmployeeDependent[];
  completion_reason?: BenefitCompletionReason;
  start_on?: Date;
  end_on?: Date;
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
  setValue: UseFormSetValue<FormValues>;
  getValues: UseFormGetValues<FormValues>;
}

type ListItemProps = {
  title: string;
  value?: string;
  style?: CSSProperties;
};

const ListItem = ({ title, value, style }: ListItemProps) => (
  <ListWrapper>
    <div className={'title'}>{title}</div>
    <div className={'value'} style={!value ? undefined : style}>
      {value ? value : '-'}
    </div>
  </ListWrapper>
);

export const Modal = ({
  actionLoading,
  control,
  errors,
  handleSubmit,
  person,
  isOpen,
  title,
  onCloseModal,
  watch,
  setValue,
  getValues,
}: ModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const [openAddBenefit, setOpenAddBenefit] = useState(false);
  const [openAddParticipant, setOpenAddParticipant] = useState(false);

  const benefit = watch('benefit');
  const endOn = watch('end_on');

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
    <>
      <DialogModal
        open={isOpen}
        onClose={onCloseModal}
        title={title}
        withButtons
        cancelButtonText={t('globaly.cancel')}
        actionButtonText={t('globaly.save')}
        actionButton={() => handleSubmit(onFormError)}
        actionLoading={actionLoading}
        fullWidth
        PaperProps={{
          style: {
            height: '100%',
          },
        }}
        maxWidth={'md'}
        nominalHeader={
          <EmpEditHeader
            employeeName={`${person.first_name} ${person.last_name}`}
            avatarUuid={person.uuid}
            employeeId={person.id}
            jobData={person.active_job_detail}
          />
        }
      >
        <Container>
          <FlexContainer>
            <div style={{ flex: 3 }}>
              <StyledFieldItem>
                <label>
                  {t('benefits.benefit.name')}
                  <sup>*</sup>
                </label>
                <Controller
                  name={'benefit'}
                  control={control}
                  rules={{
                    required: t('validations.is_required', {
                      attribute: t('benefits.benefit.name'),
                    }),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <SelectDropdown
                      inputPlaceholder={t('components.select.placeholder', {
                        field: t('benefits.benefit.name'),
                      })}
                      onChange={(_, value) => onChange(value)}
                      onAddItem={() => {
                        setOpenAddBenefit(true);
                      }}
                      value={value}
                      loadRemoteData={() => getBenefits()}
                      errorText={errors.benefit ? errors.benefit.message : ''}
                      freeSolo={true}
                    />
                  )}
                />
              </StyledFieldItem>
              <StyledFieldItem>
                <label>
                  {t('benefits.benefit.participants')}
                  <sup>*</sup>
                </label>
                <Controller
                  name={'participants'}
                  control={control}
                  rules={{
                    validate: (value) =>
                      value.length
                        ? undefined
                        : t('validations.is_required', {
                            attribute: t('benefits.benefit.participants'),
                          }),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Multiselect
                      placeholder={
                        value.length
                          ? ''
                          : t('components.select.placeholder', {
                              field: t('benefits.benefit.participants'),
                            })
                      }
                      onChange={onChange}
                      onAddItem={() => {
                        setOpenAddParticipant(true);
                      }}
                      value={value}
                      loadRemoteData={() => getEmployeeDependents(person.id)}
                      errorText={errors.participants?.message}
                    />
                  )}
                />
              </StyledFieldItem>
            </div>
            <BenefitData style={{ flex: 2 }}>
              <ListItem
                title={t('benefits.benefit.benefit_type')}
                value={benefit?.benefit_type.name}
              />
              <ListItem
                title={t('benefits.benefit.coverage_type')}
                value={benefit?.coverage_type.name}
              />
              <ListItem
                title={t('benefits.benefit.total_cost')}
                style={{ font: 'normal normal bold 16px/9px Aspira Wide Demi' }}
                value={
                  !benefit?.total_cost
                    ? undefined
                    : `${benefit.currency.symbol} ${Number(benefit.total_cost).toFixed(2)}`
                }
              />
              <ListItem
                title={t('benefits.benefit.employee_company')}
                style={{ font: 'normal normal bold 16px/9px Aspira Wide Demi' }}
                value={
                  !benefit?.employee_pays
                    ? undefined
                    : `
                    ${benefit?.currency.symbol} ${Number(benefit?.employee_pays).toFixed(2)} / 
                    ${benefit?.currency.symbol} ${Number(benefit?.company_pays).toFixed(2)}
                  `
                }
              />
            </BenefitData>
          </FlexContainer>
          <div>
            <SubTitle>{t('settings.benefit.benefit_effective_period')}</SubTitle>
            <FlexContainer>
              <FlexContainer style={{ flex: 3 }}>
                <StyledFieldItem style={{ flex: 1 }}>
                  <Controller
                    name={'start_on'}
                    control={control}
                    rules={{
                      required: t('validations.is_required', {
                        attribute: t('benefits.benefit.benefit_starts'),
                      }),
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        label={t('benefits.benefit.benefit_starts')}
                        required
                        selected={value}
                        onChange={onChange}
                        errorText={errors.start_on ? errors.start_on.message : ''}
                      />
                    )}
                  />
                </StyledFieldItem>
                <StyledFieldItem style={{ flex: 1 }}>
                  <Controller
                    name={'end_on'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        label={t('benefits.benefit.benefit_ends')}
                        selected={value}
                        onChange={onChange}
                        errorText={errors.end_on ? errors.end_on.message : ''}
                      />
                    )}
                  />
                </StyledFieldItem>
              </FlexContainer>
              {endOn ? (
                <StyledFieldItem style={{ flex: '2 1 2.4%' }}>
                  <label>
                    {t('benefits.benefit.completion_reason')}
                    <sup>*</sup>
                  </label>
                  <Controller
                    name={'completion_reason'}
                    control={control}
                    rules={{
                      required: endOn
                        ? t('validations.is_required', {
                            attribute: t('benefits.benefit.completion_reason'),
                          })
                        : undefined,
                    }}
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        selectOnFocus
                        clearOnBlur
                        inputPlaceholder={t('components.select.placeholder', {
                          field: t('benefits.benefit.completion_reason'),
                        })}
                        onChange={(_, value) => onChange(value)}
                        value={value}
                        loadRemoteData={() => getBenefitCompletionReasons()}
                        errorText={errors.completion_reason ? errors.completion_reason.message : ''}
                      />
                    )}
                  />
                </StyledFieldItem>
              ) : (
                <div style={{ flex: '2 1 2.4%' }} />
              )}
            </FlexContainer>
          </div>
        </Container>
      </DialogModal>
      <Add
        afterSubmit={(value) => {
          setValue('participants', [...getValues().participants, value]);
          queryClient.invalidateQueries('get_employee_dependent');
        }}
        person={person}
        isOpen={openAddParticipant}
        onCloseModal={() => setOpenAddParticipant(false)}
        refreshData={() => getEmployeeDependents(person.id)}
      />
      <BenefitModal
        afterSubmit={(value) => setValue('benefit', value)}
        singularTitle={t('settings.menu.singularTitle.benefit')}
        isOpen={openAddBenefit}
        endpoint={'/benefit'}
        editModalState={null}
        refreshData={() => getBenefits()}
        onCloseModal={() => setOpenAddBenefit(false)}
      />
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

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

const FlexContainer = styled.div`
  display: flex;
  gap: 10px;
  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const ToastContentContainer = styled.div`
  & > b {
    font-family: 'Aspira Demi', 'FiraGO Regular';
  }
`;

const BenefitData = styled.div`
  height: 145px;
  background-color: var(--meddium-green);
  color: var(--black);
  padding: 13px;
  margin-top: 22px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SubTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
`;

const ListWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 17px;

  .title {
    margin-right: 12px;
    flex: 1.2;
  }

  .value {
    flex: 1;
    display: block;
    line-height: normal !important;
  }
`;
