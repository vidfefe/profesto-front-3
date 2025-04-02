import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { currentUserSelector } from "redux/selectors";
import { useSelector } from "react-redux";

import { ReactComponent as ArcIcon } from 'assets/svg/arc.svg';
import { ReactComponent as SuccessArt } from 'assets/svg/onboarding_success-art.svg';
import { useTranslation } from "react-i18next";

export default function Success() {
  const { t } = useTranslation();
  const currentUser = useSelector(currentUserSelector);
  const svgString = encodeURIComponent(renderToStaticMarkup(<ArcIcon />));
  return (
    <Container style={{
      backgroundImage: `url('data:image/svg+xml;utf8, ${svgString}')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left center'
    }}>
      <SuccessArt style={{ maxWidth: 287, maxHeight: 230 }} />
      <h4>{t('onBoarding.success.nice_job', {firstName: currentUser?.employee?.first_name})}</h4>
      <br />
      <p>{t('onBoarding.success.onboarding_process_in')} <br /><b>{currentUser?.company.name}</b></p>
      <br /> <br />
      <p>{t('onBoarding.success.your_information_reviewed')}<br />{t('onBoarding.success.employee_profile')}</p>
    </Container>
  )
};

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #F8F8F7;

  & > p {
    & > b {
      font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    }
    font-size: 16px;
    color: #676767;
    text-align: center;
  }

  & > h4 {
    font-size: 33px;
    color: #676767;
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    margin-top: 25px;
  }
`;