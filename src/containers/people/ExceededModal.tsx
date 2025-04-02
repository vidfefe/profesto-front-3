import { useEffect, useState } from "react";
import styled from "styled-components";
import useQuery from "hooks/useQueryCustom";
import LinearProgress from "@mui/material/LinearProgress";
import DialogModal, { IDialogProps } from "components/Modal/Dialog";
import { usePermissionGate } from "permissions/usePermissionGate";

import { ReactComponent as EmployeesIcon } from 'assets/svg/persons_circles.svg';
import { useTranslation } from "react-i18next";
import { billing } from "lib/Subscription";

interface IExceededModal extends IDialogProps {
    onClose?: () => void,
    subscriptionData: {
        count: number,
        employee_count: number,
        plan: string,
        trial: number
    },
    contactDetailsVisible?: boolean,
};

export default function ExceededModal({ onClose, subscriptionData, contactDetailsVisible, ...rest }: IExceededModal) {
    const { t } = useTranslation();
    const [portalTargetLink, setPortalTargetLink] = useState<string>('')
    const { role } = usePermissionGate();

    const { refetch: getPortalLink, isFetching: isLinkFetching } = useQuery<any>(["portal_url"], {
        endpoint: `billing/portal_link?to=${portalTargetLink}`,
        options: { method: "get" },
    }, { enabled: false });

    const onClickChoosePlan = async () => {
        const { data } = await getPortalLink();
        window.open(data.url, '_blank');
        setPortalTargetLink('');
        onClose?.();
    };

    useEffect(() => {
        if (portalTargetLink) {
            onClickChoosePlan();
        }
    }, [portalTargetLink]);

    const renderUpgradeTextOffer = () : any => {
        if (billing()) {
            if (role === 'owner' && subscriptionData?.plan?.toLowerCase() === 'basic') {
                return <>{t('homePage.please')} <span onClick={() => setPortalTargetLink('homePage.update_plan')}>{t('homePage.upgrade_your_plan')}</span> {t('homePage.to_add_more_employees')}</>
            }
            if (role === 'owner' && subscriptionData?.plan?.toLowerCase() === 'core') {
                return <>{t('homePage.please')} <span onClick={() => setPortalTargetLink('homePage.update_quantity')}>{t('homePage.upgrade_available_seats_number')}</span> {t('homePage.to_add_more_employees')}</>
            }
            return t('homePage.please_contact_account_owner');
        } else {
            return t('homePage.limit_has_been_reached_contact_support',
                { supportEmail: process.env.REACT_APP_SUPPORT_EMAIL, supportPhone: process.env.REACT_APP_SUPPORT_PHONE});
        }
    };

    return (
        <DialogModal
            withButtons
            onClose={() => onClose?.()}
            actionButton={() => onClose?.()}
            actionButtonText={t('homePage.close')}
            title={t('homePage.limit_has_been_reached')}
            hideCancelButton
            fullWidth
            upperPosition
            {...rest}
        >
            <ExceededModalContentContainer>
                <EmployeesIcon />
                <ModalMainText dangerouslySetInnerHTML={{ __html: t('homePage.limit_has_been_reached_out_of',
                        {emplCount: subscriptionData?.employee_count, subscriptionCount: subscriptionData?.count}) }}/>
                <ModalSecondaryText>
                    <div dangerouslySetInnerHTML={{ __html: renderUpgradeTextOffer() }} />
                    {isLinkFetching ? <LinearProgress /> : <div style={{ height: 4 }} />}
                </ModalSecondaryText>
                {billing() && role === 'owner' && contactDetailsVisible ? <ModalSecondaryText style={{ marginTop: 2 }}>{t('homePage.or')}</ModalSecondaryText> : null}
                {billing() && role === 'owner' && contactDetailsVisible ? <ModalSecondaryText style={{ marginTop: 2 }}>
                    {t('homePage.contact_us_at')} <a href={process.env.REACT_APP_SALES_EMAIL}>{process.env.REACT_APP_SALES_EMAIL}</a> {t('homePage.free_up_the_seats')}
                </ModalSecondaryText> : null}
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