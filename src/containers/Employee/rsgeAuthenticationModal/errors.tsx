import React, { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";
import { useTranslation } from "react-i18next";
import { ReactComponent as CircleError } from 'assets/svg/CircleError.svg';
import { ReactComponent as CircleErrorIcon } from 'assets/svg/circleErrorIcon.svg';
import { ReactComponent as AlertIcon } from 'assets/svg/alertIcon.svg';

const RsgeErros = (props: any) => {
    const { isOpen, onModalClose, errors, reSendData, title = null } = props;
    const { t } = useTranslation();

    return (
        <DialogModal
            open={isOpen}
            title={title}
            onClose={() => onModalClose()}
            actionButton={() => reSendData()}
            withButtons
            hideActionButton={errors?.type ? true : false}
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('leftMenuCard.rsgForm.resendRsge')}
            actionLoading={props.loadingRequest}
            fullWidth
            upperPosition
        >
            <ModalContentContainer>
                {errors?.type ?
                    <Fragment>
                        <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2}}>
                            <CircleError/> 
                            <div style={{position: 'absolute', top: 32}}>{errors?.type !== 'personal' ? <AlertIcon/> : <CircleErrorIcon/>}</div>
                        </div>
                        <ModalMainText>{errors?.message}</ModalMainText>
                        <ModalSecondaryText dangerouslySetInnerHTML={{ __html: errors?.description as string}}/>
                        {errors?.fields && <ContentButtles>
                            <BulletContainer>
                                {errors?.fields.map((field: string) => (
                                    <Item><Disc/> {field}</Item>
                                ))}
                            </BulletContainer>
                        </ContentButtles>}
                    </Fragment> 
                : 
                <Fragment>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2}}>
                        <CircleError/> 
                        <div style={{position: 'absolute', top: 32}}><CircleErrorIcon/></div>
                    </div>
                    <ModalMainText>{errors?.message}</ModalMainText>
                    <ModalSecondaryText dangerouslySetInnerHTML={{ __html: errors?.description as string}}/>
                </Fragment> 
                }
            </ModalContentContainer>
        </DialogModal>
    );
};
const ContentButtles = styled.div `
    margin-top: 20px;
`
const BulletContainer = styled.div `
    display: flex;
    flex-direction: column;
    gap: 5px;
`
const Item = styled.div `
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 15px;
`

const Disc = styled.div `
    background-color: #A8A8A8;
    width: 8px;
    height: 8px;
    border-radius: 8px;
`
const ModalContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #FFF;
  padding: 20px 40px;
`;
const ModalMainText = styled.p`
  margin-top: 25px;
  font-size: 14px;
  font-family: 'Aspira Demi', 'FiraGO Medium';
  color: #676767;
  text-align: center;
`;

const ModalSecondaryText = styled.div`
  margin-top: 20px;
  font-size: 13px;
  color: #676767;
  text-align: center;
  & > span {
    color: #339966;
    text-decoration: underline;
    cursor: pointer;
  }
`;
export default RsgeErros;