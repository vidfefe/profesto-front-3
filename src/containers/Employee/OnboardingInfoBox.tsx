import { Fragment, useState } from "react"
import { Link } from "react-router-dom";
import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";
import RadioButton from "components/RadioButton";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from '@mui/material/Button'
import useMutationCustom from "hooks/useMutationCustom";
import { useToasts } from "react-toast-notifications";
import isPast from 'date-fns/isPast';
import isToday from 'date-fns/isToday';
import { useTranslation } from "react-i18next";
import { ReactComponent as WarningSign } from 'assets/svg/exclamation_mark-sign.svg';
import { ReactComponent as PersonIcon } from 'assets/svg/person_with_plus-circle.svg';
import { ReactComponent as ResendIcon } from 'assets/svg/refresh-arrows_circle.svg';
import { ReactComponent as CancelIcon } from 'assets/svg/close-circle.svg';
import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';
import { dateFormat } from "lib/DateFormat";
import { currentUserSelector } from "redux/selectors";
import { useSelector } from "react-redux";


type TMutationData = { errors?: [{ message: string }] };

export default function OnboardingInfoBox({ person, refreshEmployeeInfo }: { person: any, refreshEmployeeInfo: any }) {
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const [isCancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [isInviteInfoModalOpen, setInviteInfoModalOpen] = useState<boolean>(false);
  const [isCancelInfoModalOpen, setCancelInfoModalOpen] = useState<boolean>(false);
  const [isAllowedAccess, setAllowedAccess] = useState<string>('');
  const [isApproveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [isApproveInfoModalOpen, setApproveInfoModalOpen] = useState<boolean>(false);
  const currentUser = useSelector(currentUserSelector);


  const { mutate: reinviteOnboarding, error: reinviteError } = useMutationCustom<string[], TMutationData, {}>(["onboarding_reinvite"], {
    endpoint: 'onboarding/admin/re_invite', options: { method: "post" },
  }, {
    onSuccess: () => {
      addToast(t('onBoarding.onboardingInfoBox.invitation_sent_successfully'), { appearance: 'success', autoDismiss: true });
    },
    onError: () => setInviteInfoModalOpen(true),
  });

  const { mutate: cancelOnboarding, isLoading: cancelLoading, error: cancelError } = useMutationCustom<string[], TMutationData, {}>(["onboarding_cancel"], {
    endpoint: 'onboarding/admin/cancel', options: { method: "post" },
  }, {
    onSuccess: () => {
      addToast(t('onBoarding.onboardingInfoBox.self_onboarding_process_canceled'), { appearance: 'success', autoDismiss: true });
      refreshEmployeeInfo();
      setCancelModalOpen(false);
    },
    onError: () => { setCancelInfoModalOpen(true); setCancelModalOpen(false); },
  });

  const { mutate: approveOnboarding, isLoading: approveLoading, error: approveError } = useMutationCustom<string[], TMutationData, {}>(["onboarding_approve"], {
    endpoint: 'onboarding/admin/approve', options: { method: "post" },
  }, {
    onSuccess: () => {
      addToast(t('onBoarding.onboardingInfoBox.employee_information_approved'), { appearance: 'success', autoDismiss: true });
      refreshEmployeeInfo();
      setApproveModalOpen(false);
    },
    onError: () => { setApproveInfoModalOpen(true); setApproveModalOpen(false); },
  });

  const hasPermission = () => {
    return person.id !== currentUser.id && currentUser.permissions.role === 'manager'
  }

  const renderStatusTitle = (status: string) => {
    if (status === 'in_progress') return t('onBoarding.onboardingInfoBox.self_onboarding_progress');
    if (status === 'filled') {
      if(hasPermission())
        return t('onBoarding.onboardingInfoBox.ready_review', {firstName: person.first_name}); 
      else
        return t('onBoarding.onboardingInfoBox.ready_your_review', {firstName: person.first_name});
    }
    if (status === 'i9_to_sign') return t('onBoarding.onboardingInfoBox.review_and_signature', {firstName: person.first_name});
  };

  const renderStatusDescText = (status: string, i9form: boolean, documents_uploaded: boolean, firstDay: any) => {
    if (status === 'in_progress' && i9form) {
      return (
        <p dangerouslySetInnerHTML={{ __html: t('onBoarding.onboardingInfoBox.personal_information_address', {firstName: person.first_name})}}/>
      );
    };
    if (status === 'in_progress' && !i9form) {
      return (
        <>
          {(hasPermission())
            ? <p dangerouslySetInnerHTML={{ __html: t('onBoarding.onboardingInfoBox.hiring_process', {firstName: person.first_name})}}/>
            : <p dangerouslySetInnerHTML={{ __html: t('onBoarding.onboardingInfoBox.hiring_process_for_reviewer', {firstName: person.first_name})}}/> }
        </>
      );
    };
    if (status === 'filled' && i9form) {
      return (
        documents_uploaded ? <p dangerouslySetInnerHTML={{ __html: t('onBoarding.onboardingInfoBox.start_section', {firstName: person.first_name})}}/>
          : <p dangerouslySetInnerHTML={{ __html: t('onBoarding.onboardingInfoBox.completed_personal_details', {firstName: person.first_name})}}/>
      );
    };
    if (status === 'filled' && !i9form) {
      if(!hasPermission())
        return (
          documents_uploaded ? <p dangerouslySetInnerHTML={{ __html: t('onBoarding.onboardingInfoBox.please_review_and_approve', {firstName: person.first_name})}}/>
            :  <p dangerouslySetInnerHTML={{ __html: t('onBoarding.onboardingInfoBox.please_review_approve_information', {firstName: person.first_name})}}/>
        );
    };
    if (status === 'i9_to_sign' && firstDay) {
      if (isPast(new Date(firstDay.date)) && !isToday(new Date(firstDay.date))) {
        return <p>{t('onBoarding.onboardingInfoBox.first_day_was', {firstName: person.first_name})} {dateFormat(new Date(firstDay.date), 'longDayAndMontn')}</p>
      } else return <p>{t('onBoarding.onboardingInfoBox.first_day_is', {firstName: person.first_name})} {dateFormat(new Date(firstDay.date), 'longDayAndMontn')}</p>
    };
  };

  const renderStatusActions = (status: string) => {
    if (status === 'in_progress') {
      return (
        <Fragment>
          {t('onBoarding.onboardingInfoBox.you_can')}
          {person.onboarding.onboarding_status.id === 'in_progress' ?
            <ActionsWithIconContainer onClick={() => reinviteOnboarding({ employee_id: person.id })}>
              <PersonIcon />
              <p>{t('onBoarding.onboardingInfoBox.resend_the_invitation')}</p>
            </ActionsWithIconContainer> : null}
          <ActionsWithIconContainer>
            <ResendIcon />
            <p><Link to={`/onboarding/update/${person.id}`}>{t('onBoarding.onboardingInfoBox.update_onboarding')}</Link></p>
          </ActionsWithIconContainer>
          {t('onBoarding.onboardingInfoBox.or')}
          <ActionsWithIconContainer onClick={() => setCancelModalOpen(true)}>
            <CancelIcon />
            <p>{t('onBoarding.onboardingInfoBox.cancel_onboarding_enter_details_yourself')}</p>
          </ActionsWithIconContainer>
        </Fragment>
      )
    };
    if (status === 'filled') {
      return (
        <Button
          variant="contained"
          size="large"
          onClick={() => setApproveModalOpen(true)}
        >
          {t('onBoarding.onboardingInfoBox.approve_information')}
        </Button>
      )
    };
    if (status === 'i9_to_sign') {
      return (
        <Link to={`/onboarding/review/${person.id}`}>
          <Button
            variant="contained"
            size="large"
          >
            {t('onBoarding.onboardingInfoBox.review_sign_form_i9')}
          </Button>
        </Link>
      )
    };
  };

  return (
    <Fragment>
      <OnboardingInfoBoxContainer>
        <InfoBoxTitle>
          <WarningSign />
          <p>{renderStatusTitle(person.onboarding.onboarding_status.id)}</p>
          {renderStatusDescText(
            person.onboarding.onboarding_status.id,
            person.onboarding.fill_i9,
            person.onboarding.documents_uploaded,
            person.onboarding.first_day
          )}
        </InfoBoxTitle>
        { !hasPermission() &&
          <InfoBoxActionsContainer>
              {renderStatusActions(person.onboarding.onboarding_status.id)}
          </InfoBoxActionsContainer> }
      </OnboardingInfoBoxContainer>
      <DialogModal
        open={isCancelModalOpen}
        onClose={() => { setCancelModalOpen(false); setAllowedAccess(''); }}
        withButtons
        upperPosition
        actionButton={() => cancelOnboarding({ employee_id: person.id, allow_access: isAllowedAccess === 'yes' ? true : false })}
        fullWidth
        title={t('onBoarding.onboardingInfoBox.cancel_self_onboarding', {firstName: person.first_name})}
        cancelButtonText={t('onBoarding.onboardingInfoBox.no_dont_cancel')}
        actionButtonText={t('onBoarding.onboardingInfoBox.yes_cancel_self_onboarding')}
        actionButtonTooltipText={isAllowedAccess ? '' : t('onBoarding.onboardingInfoBox.please_fill_system_access_option')}
        actionButtonDisabled={isAllowedAccess ? false : true}
        actionLoading={cancelLoading}
      >
        <ModalContentContainer>
          <WarningMark />
          <p>{t('onBoarding.onboardingInfoBox.are_you_sure_you_want_cancel', {firstName: person.first_name})}</p>
          <p>{t('onBoarding.onboardingInfoBox.with_access_profesto', {firstName: person.first_name})}</p>

          <RadioGroup value={isAllowedAccess} onChange={(_, value) => setAllowedAccess(value)} sx={{ paddingBlock: 2 }} row>
            <FormControlLabel value={'yes'} control={<RadioButton />} label={t('onBoarding.onboardingInfoBox.allow_access_to')} />
            <FormControlLabel value={'no'} control={<RadioButton />} label={t('onBoarding.onboardingInfoBox.disable_system_access')} />
          </RadioGroup>
        </ModalContentContainer>
      </DialogModal>

      <DialogModal
        open={isInviteInfoModalOpen}
        onClose={() => setInviteInfoModalOpen(false)}
        withButtons
        upperPosition
        actionButton={() => setInviteInfoModalOpen(false)}
        fullWidth
        actionButtonText={t('globaly.close')}
      >
        <ModalContentContainer>
          <WarningMark />
          <p>{t('onBoarding.onboardingInfoBox.invitation_link_cant_be_sent')}</p>
          <p>{reinviteError?.errors?.[0].message}</p>
        </ModalContentContainer>
      </DialogModal>

      <DialogModal
        open={isCancelInfoModalOpen}
        onClose={() => { setCancelInfoModalOpen(false); refreshEmployeeInfo(); }}
        withButtons
        upperPosition
        actionButton={() => { setCancelInfoModalOpen(false); refreshEmployeeInfo(); }}
        fullWidth
        actionButtonText={t('globaly.close')}
      >
        <ModalContentContainer>
          <WarningMark />
          <p>{t('onBoarding.onboardingInfoBox.onboarding_process_cant_be_canceled')}</p>
          <p>{cancelError?.errors?.[0].message}</p>
        </ModalContentContainer>
      </DialogModal>

      <DialogModal
        open={isApproveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={t('onBoarding.onboardingInfoBox.approve_firstname_information', {firstName: person.first_name})}
        withButtons
        upperPosition
        actionButton={() => approveOnboarding({ employee_id: person.id })}
        fullWidth
        cancelButtonText={t('onBoarding.onboardingInfoBox.no_not_yet')}
        actionButtonText={t('onBoarding.onboardingInfoBox.yes_approve')}
        actionLoading={approveLoading}
      >
        <ModalContentContainer>
          <WarningMark />
          <p style={{ fontSize: 12 }}>{t('onBoarding.onboardingInfoBox.are_you_want_to_approve_information', {firstName: person.first_name})}</p>
        </ModalContentContainer>
      </DialogModal>

      <DialogModal
        open={isApproveInfoModalOpen}
        onClose={() => { setApproveInfoModalOpen(false); refreshEmployeeInfo(); }}
        withButtons
        upperPosition
        actionButton={() => { setApproveInfoModalOpen(false); refreshEmployeeInfo(); }}
        fullWidth
        actionButtonText={t('globaly.close')}
      >
        <ModalContentContainer>
          <WarningMark />
          <p>{t('onBoarding.onboardingInfoBox.employee_information_cant_approved')}</p>
          <p>{approveError?.errors?.[0].message}</p>
        </ModalContentContainer>
      </DialogModal>
    </Fragment>
  )
};

const OnboardingInfoBoxContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 188px;
  background-color: #FCF2E4;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 10px 20px;
`;

const InfoBoxTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  & > svg {
    margin-bottom: 14px;
  };
  & > p:first-of-type {
    font-size: 12px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    color: #414141;
    margin-bottom: 14px;
  }
  & > p:last-of-type {
    font-size: 11px;
    color: #414141;
    margin-bottom: 14px;
  };
`;

const InfoBoxActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #414141;
  font-size: 11px;
`;

const ActionsWithIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-inline: 5px;
  cursor: pointer;
  & > svg {
    margin-right: 4px;
  };
  & > p {
    font-size: 11px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    color: #F4906A;
    text-decoration: underline;
  };
  &:hover > svg {
    path:not(:first-child) {
      fill: #B46041;
    };
  };
  &:hover > p {
      color: #B46041;
  };
`;

const ModalContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 30px 20px;
  & > svg {
    margin-bottom: 25px;
  };
  & > p:first-of-type {
    font-size: 12px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    color: #414141;
    margin-bottom: 14px;
  }
  & > p:last-of-type {
    font-size: 11px;
    color: #676767;
    margin-bottom: 14px;
  };
`;