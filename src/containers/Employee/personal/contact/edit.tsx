import { useEffect } from "react";
import styled from "styled-components";
import { useForm } from 'react-hook-form';
import { useToasts } from "react-toast-notifications";
import { FORM_PATTERNS } from '../../../../constants';
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../../editHeader";
import DialogModal from "components/Modal/Dialog";
import { useTranslation } from "react-i18next";
const ContactInformationEdit = (props: any) => {
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const { register, handleSubmit, watch, setValue, setError, trigger, formState: { errors } } = useForm();
  const watchValues = watch();
  const { user, jobData, contactInfoData } = props;
  const watchWorkEmail = watch('work_email');
  const watchPersonalEmail = watch('personal_email');

  useEffect(() => {
    if (contactInfoData) {
      setValue('work_phone', contactInfoData.work_phone);
      setValue('work_phone_ext', contactInfoData.work_phone_ext);
      setValue('mobile_phone', contactInfoData.mobile_phone);
      setValue('home_phone', contactInfoData.home_phone);
      setValue('work_email', contactInfoData.work_email)
      setValue('personal_email', contactInfoData.personal_email)
      setValue('linkedin', contactInfoData.linkedin)
      setValue('twitter', contactInfoData.twitter)
      setValue('facebook', contactInfoData.facebook)
    }

  }, [contactInfoData, props.isOpen]);

  useEffect(() => {
    if (watchWorkEmail || watchPersonalEmail) {
      trigger("work_email");
      trigger("personal_email");
    }
  }, [watchWorkEmail, trigger, watchPersonalEmail]);

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  useEffect(() => {
    for (const prop of Object.getOwnPropertyNames(errors)) {
      delete errors[prop];
    }
  }, [props.isOpen])

  useEffect(() => {
    if (props.editErrors) {
      props.editErrors.map((item: any) => setError(item.field, { type: 'string', message: item.message }))
    }
  }, [props.editErrors]);

  const onError = (err: any) => {
    if (err) {
      addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted')}}/>, {
        appearance: 'error',
        autoDismiss: true,
        placement: 'top-center'
      });
    }
  };

  return (
    <DialogModal
      open={props.isOpen}
      title={t('myInfo.edit_contact_information')}
      onClose={() => { props.onModalClose() }}
      actionButton={handleSubmit(onSubmit, onError)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={props.loadingRequest}
      nominalHeader={
        <EmpEditHeader
          employeeName={`${user.first_name} ${user.last_name}`}
          avatarUuid={user.uuid}
          employeeId={user.id}
          jobData={jobData}
        />
      }
      maxWidth={'md'}
    >
      <Wrapper>
        <form>
          <SubTopic>{t('employee.contact.phone')}</SubTopic>
          <div className="input-item work-phone">
            <span>
              <label>{t('employee.contact.work_phone')}</label>
              <UniversalInput
                {...register("work_phone")}
              />
            </span>
            <span>
              <label>{t('globaly.ext')}</label>
              <UniversalInput
                {...register("work_phone_ext")}
              />
            </span>
          </div>

          <div className='input-item'>
            <label>{t('employee.contact.mobile_phone')}</label>
            <UniversalInput
              {...register("mobile_phone")}
            />
          </div>

          <div className='input-item'>
            <label>{t('employee.contact.home_phone')}</label>
            <UniversalInput
              {...register("home_phone")}
            />
          </div>

          <SubTopic>{t('employee.contact.email')}</SubTopic>

          <div className='input-item'>
            <div className='input-item'>
              <label>{t('employee.contact.work_email')}</label>
              <UniversalInput
                errorText={errors?.work_email?.message as any}
                {...register("work_email", {
                  validate: async (value: any) => {
                    return (!value || !watchValues.personal_email || value !== watchValues.personal_email)
                      || t('validations.emails_should_not_be_the_same')
                  },
                  pattern: FORM_PATTERNS.email
                })}
              />
            </div>

            <div className='input-item'>
              <label>{t('employee.contact.personal_email')}</label>
              <UniversalInput
                errorText={
                  errors.personal_email ? errors.personal_email.message : "" as any
                }
                {...register("personal_email", {
                  validate: (value: any) => {
                    return (!value || !watchValues.work_email || value !== watchValues.work_email)
                      || t('validations.emails_should_not_be_the_same')
                  },
                  pattern: FORM_PATTERNS.email
                })}
              />
            </div>
          </div>

          <SubTopic>{t('onBoarding.personalDetails.social_links')}</SubTopic>

          <div className='input-item'>
            <label>Linkedin</label>
            <UniversalInput
              errorText={
                errors.Linkedin ? t('validations.please_enter_mobile_phone') : ""
              }
              {...register("linkedin")}
            />
          </div>

          <div className='input-item'>
            <label>Facebook</label>
            <UniversalInput
              errorText={
                errors.mobile_phone ? t('validations.please_enter_mobile_phone') : ""
              }
              {...register("facebook")}
            />
          </div>

          <div className='input-item'>
            <label>Twitter</label>
            <UniversalInput
              errorText={
                errors.mobile_phone ? t('validations.please_enter_mobile_phone') : ""
              }
              {...register("twitter")}
            />
          </div>
        </form>
      </Wrapper>
    </DialogModal>
  );
};

export default ContactInformationEdit;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
  .input-item {
    margin-bottom: 15px;
    width: 416px;
    & > label {
    margin-bottom: 6px;
    margin-top: 6px;
    display: inline-block;
    & > sup {
      color: #C54343;
    }
  }
  }
  .work-phone {
    display: flex;
    width: auto;
    span:first-child {
      width: 414px;
      margin-right: 10px;
    }
    & label {
      margin-bottom: 6px;
      margin-top: 6px;
      display: inline-block;
    }
  }
`;

const SubTopic = styled.div`
  font-weight: bold;
  padding-bottom: 8px;
  padding-top: 8px;
`;
