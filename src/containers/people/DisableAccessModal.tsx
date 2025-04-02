import styled from "styled-components";
import DialogModal, { IDialogProps } from "components/Modal/Dialog";
import { usePermissionGate } from "permissions/usePermissionGate";

import { ReactComponent as EmployeesIcon } from 'assets/svg/persons_circles.svg';
import { useTranslation } from "react-i18next";

interface IExceededModal extends IDialogProps {
    subscriptionData: {
        count: number,
        employee_count: number,
        plan: string,
        trial: number
    }
};

export default function DisableAccessModal({ subscriptionData, ...rest }: IExceededModal) {
    const { t } = useTranslation();
    const { role } = usePermissionGate();

    return (
        <DialogModal
            withButtons={false}
            title={t('homePage.limit_has_been_reached')}
            fullWidth
            upperPosition
            {...rest}
        >
            <ExceededModalContentContainer>
                <EmployeesIcon />
                <ModalMainText dangerouslySetInnerHTML={{ __html: t('homePage.limit_access',
                        {emplCount: subscriptionData?.employee_count, subscriptionCount: subscriptionData?.count}) }}/>
                <ModalSecondaryText>
                    {role === 'owner' && <div dangerouslySetInnerHTML={{
                        __html: t('homePage.limit_access_secondary',
                            {
                                supportEmail: process.env.REACT_APP_SUPPORT_EMAIL,
                                supportPhone: process.env.REACT_APP_SUPPORT_PHONE
                            })
                    }}/>}
                    {role !== 'owner' && <div dangerouslySetInnerHTML={{
                        __html: t('homePage.limit_access_secondary_for_employee')
                    }}/>}
                </ModalSecondaryText>
            </ExceededModalContentContainer>
        </DialogModal>
    )
};

const ExceededModalContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 50px;
`;

const ModalMainText = styled.p`
  margin-top: 25px;
  font-size: 13px;
  font-family: 'Aspira Demi', 'FiraGO Regular';
  color: #676767;
  text-align: center;
`;

const ModalSecondaryText = styled.div`
  margin-top: 25px;
  font-size: 12px;
  color: #676767;
  text-align: center;
  & > span, a {
    color: #339966;
    text-decoration: underline;
    cursor: pointer;
  }
`;