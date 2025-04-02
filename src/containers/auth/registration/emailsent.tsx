import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { ReactComponent as MailIcon } from 'assets/svg/reg-mail.svg';
import { ReactComponent as ArcIcon } from 'assets/svg/arc.svg';
import { useTranslation } from "react-i18next";
const svgString = encodeURIComponent(renderToStaticMarkup(<ArcIcon />));

const EmailSent = () => {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <MailIcon style={{ maxWidth: 327, maxHeight: 184, marginTop: '8%' }} />
      <ContentContainer>
        <h4>{t('auth.registration.emailSent.check_your_email')}</h4>
        <br />
        <p>{t('auth.registration.emailSent.almost_there')}</p>
        <br />
        <p>{t('auth.registration.emailSent.confirmation_email')}</p>
        <p dangerouslySetInnerHTML={{ __html: t('auth.registration.emailSent.link_will_expire') }}/>
        <br />
        <p style={{ fontWeight: 'bold' }} dangerouslySetInnerHTML={{ __html: t('auth.registration.emailSent.spam_folder') }}/>
      </ContentContainer>
    </PageContainer>
  );
};

export default EmailSent;

const PageContainer = styled('div')(({ theme }) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  background: `#F8F8F7 url('data:image/svg+xml;utf8, ${svgString}') left center/cover no-repeat`,
  backgroundSize: 450,
  [theme.breakpoints.down('lg')]: {
    backgroundSize: 350,
  },
}));

const ContentContainer = styled('div')(({ theme }) => ({
  padding: 16,
  "& > p": {
    lineHeight: 1.5,
    fontSize: 15,
    color: "#676767",
    textAlign: "center",
    [theme.breakpoints.down('sm')]: {
      fontSize: 10,
    },
  },
  "& > h4": {
    fontSize: 30,
    textAlign: "center",
    color: "#676767",
    fontFamily: 'Aspira Demi',
    marginTop: "30px",
    [theme.breakpoints.down('sm')]: {
      fontSize: 18,
    },
  },
  "& > span": { color: "black", fontWeight: 900 }
}));

