import styled from "@mui/system/styled";
import getYear from "date-fns/getYear";
import { ReactComponent as EnvelopeIcon } from 'assets/svg/envelope.svg';
import { ReactComponent as PhoneIcon } from 'assets/svg/phone.svg';
import { useTranslation } from "react-i18next";
import React, {useEffect} from "react";
interface ContactItemProps {
  icon: string
  text: string | undefined
};

const ContactItem = ({ icon, text }: ContactItemProps) => {
  
  return (
    <ContactItemContainer>
      <div>{icon === 'phone' ? <PhoneIcon /> : <EnvelopeIcon />}</div>
      <span>{text}</span>
    </ContactItemContainer>
  )
};

const Footer = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'partials.footer' });

  return (
    <FooterContainer>
      <LinksContainer>
        <a target="_blank" rel="noreferrer" href='https://profesto.ge/privacy-policy/'>{t('privacy_policy')}</a>
        <span />
        <a target="_blank" rel="noreferrer" href='https://profesto.ge/terms-of-service/'>{t('terms_service')}</a>
      </LinksContainer>
      <p>© {getYear(new Date())} {t('reserved')}</p>
      <ContactItem
        icon='envelope'
        text={process.env.REACT_APP_SUPPORT_EMAIL}
      />
    </FooterContainer >
  );
};

export default Footer;

const FooterContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#FFF',
  backgroundColor: '#00101A',
  padding: '20px 60px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: 10,
    "& > p": {
      order: 1,
    },
  },
}));

const LinksContainer = styled('div')`
  display: flex;
  align-items: center;
  height: 100%;
  a:hover {
    color: var(--orange);
    text-decoration: underline;
  }
  & > span {
    display: inline-block;
    margin: 0 10px;
    &:after{
      content: '';
      display: flex;
      background: #fff;
      width: 2px;
      height: 2px;
      border-radius: 50%;
    }
  }
`;

const ContactItemContainer = styled('div')`
  display: flex;
  align-items: center;
  & > div {
    background: #27343D;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-right: 10px;
    & path {
      fill: #fff;
    }
  }
`;
