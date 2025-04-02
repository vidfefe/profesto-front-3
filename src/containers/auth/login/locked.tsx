import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useToasts } from "react-toast-notifications";
import LoadingButton from "@mui/lab/LoadingButton";
import MainErrorBox from 'components/error/mainError'
import FormContainerTemplate from "../FormContainer";
import { createUnlockRequest, confirmUnlockRequest, SendEmailAgain } from 'services';

import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { useTranslation } from "react-i18next";

const Locked = (props: any) => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const { addToast } = useToasts();
  const history = useHistory();

  useEffect(() => {
    if (params['token']) {
      confirmUnlockRequest(params['token']).then(res => {
        history.push({ pathname: '/login', state: { fromUnlock: true } });
      }).catch(err => {
        setErrorText(err.response.data.errors[0].message);
        return history.push('/login', { unlockLinkInvalid: err.response.data.errors[0].message })
      });
    } else {
      if (!props.location.state) {
        history.push({
          pathname: '/login'
        })
      } else if (props.location?.state?.email) {
        createUnlockRequest(props.location.state.email).catch(err => console.log(err.response));
      }
    }
  }, []);

  const location = useLocation();
  let params: any = queryString.parse(location.search);

  const sendEmailAgainHandler = (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    SendEmailAgain(props.location.state.email).then((res) => {
      if (res.status === 200) {
        addToast(<div>{t('auth.login.locked.check_your_email')}</div>, {
          appearance: 'success',
          autoDismiss: true
        })
      } else {
        addToast(<div>{t('auth.login.locked.something_went_wrong')}</div>, {
          appearance: 'error',
          autoDismiss: true
        })
      }
      setIsLoading(false);
    });
  };

  return (
    <FormContainerTemplate>
      <FormTopContainer>
        <ProfestoLogo
          width={274}
          height={56}
          id='profesto_logo'
        />
      </FormTopContainer>

      {!params['token'] ?
        <InformationContainer>
          <h3>{t('auth.login.locked.locked_your_account')}</h3>
          <ul className='bullets'>
            <li>{t('auth.login.locked.temporarily_locked')}</li>
            <li>{t('auth.login.locked.instructions')}</li>
          </ul>
        </InformationContainer> :
        <ExpiryContainer>
          {errorText && <MainErrorBox type='error' text={errorText} />}
        </ExpiryContainer>
      }
      <form>
        {props.location?.state?.email && <LoadingButton
          loading={isLoading}
          sx={{ marginTop: 3, fontSize: 12, padding: 2 }}
          fullWidth
          onClick={sendEmailAgainHandler}
          variant='contained'
        >
          {t('auth.login.locked.send_again')}
        </LoadingButton>}
      </form>
      <BackButton to='login'><StyledArrowIcon /> {t('button.back_sign_in')}</BackButton>
    </FormContainerTemplate>
  );
};

export default Locked;

const StyledArrowIcon = styled(ArrowIcon) <{ direction?: string, fill?: string }>`
    margin-right: 5px;
    & path {
        fill: #396;
    }
    transform: rotate(90deg);
`;

const FormTopContainer = styled.div`
  margin-bottom: 44px;
  text-align: center;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--green);
  margin-top: 20px;
  text-transform: uppercase;
`;

const ExpiryContainer = styled.div`
  margin-top: 40px; 
  p {
    margin-top: 40px;
    text-align: left;
    font-size: 13px;
    line-height: 24px;
  }
`;

const InformationContainer = styled.div`
  h3 {
    color: var(--dark-gray);
    margin-top: 20px;
    text-align: center;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    font-size: 1.4rem;
  }

  ul {
    margin-top: 30px;
    padding-left: 30px;

    li {
      position: relative;
      text-align: left;
      margin-bottom: 30px;
      color: var(--dark-gray);
      font-size: 13px;
      line-height: 24px;

      &:after {
        content: '';
        background: #99CC33;
        width: 14px;
        height: 14px;
        top: 5px;
        position: absolute;
        border-radius: 50%;
        left: -30px;
      }
    }
  }
`;
