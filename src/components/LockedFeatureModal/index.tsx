
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";
import { useTranslation } from "react-i18next";

export interface ILockedFeatureModalProps {
    title?: string,
    content?: string,
    visible: boolean,
    onCloseModal?: any,
    icon?: JSX.Element
};


const LockedFeatureModal = ({title, content, visible, icon, onCloseModal}: ILockedFeatureModalProps) => {
    const { t } = useTranslation();


    return (
      <DialogModal 
        open={visible} 
        onClose={() => onCloseModal()}
        actionButton={() => onCloseModal()}
        actionButtonText={t('globaly.close')}
        hideCancelButton
        withButtons
        fullWidth
      >
        <ModalContentContainer>
          {icon}
          <ModalMainText>{title}</ModalMainText>
          <ModalSecondaryText dangerouslySetInnerHTML={{ __html: content as string}}/>
        </ModalContentContainer>
      </DialogModal>
    )

}
const ModalContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #FFF;
  padding: 40px 50px;
`;

const ModalMainText = styled.p`
  margin-top: 25px;
  font-size: 14px;
  font-family: 'Aspira Demi', 'FiraGO Medium';
  color: #676767;
  text-align: center;
`;

const ModalSecondaryText = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: #676767;
  text-align: center;
  & > span {
    color: #339966;
    text-decoration: underline;
    cursor: pointer;
  }
`;
export default LockedFeatureModal;