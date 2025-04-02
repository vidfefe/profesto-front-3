import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Link, useHistory, useLocation } from 'react-router-dom';
import UniversalInput from "components/Input/UniversalInput";
import LoadingButton from "@mui/lab/LoadingButton";
import FormContainerTemplate from "../FormContainer";
import { RecoverPasswordService } from 'services'
import { FORM_PATTERNS } from "../../../constants";
import { useToasts } from "react-toast-notifications";

import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { useTranslation } from "react-i18next";
import ChangeLanguage from "components/ChangeLanguage";


const Recover = () => {
  const { t } = useTranslation();

  const { addToast } = useToasts();
  const { state: { email } = {} } = useLocation<any>();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<{ email: string }>({
    defaultValues: {
      email: email || ''
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();

  const watchEmail = watch('email');

  const onSubmit = (data: { email: string }) => {
    setIsLoading(true);
    RecoverPasswordService(data.email).then(res => {
      addToast(t('auth.recover.check_your_email'), {
        appearance: 'success',
        autoDismiss: true
      });
      setIsLoading(false);
      setValue('email', '')
      history.push('/login')
    }).catch((err) => {
      addToast(err.response.data.errors[0].message, {
        appearance: 'error',
        autoDismiss: true
      });
      setIsLoading(false);
    })
  };

  return (
    <FormContainerTemplate>
      <FormTopContainer>
        <ProfestoLogo
          width={274}
          height={56}
          id='profesto_logo'
        />
        <h3>{t('auth.recover.enter_your_email')}</h3>
      </FormTopContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <UniversalInput
          size='medium'
          placeholder={t('auth.recover.placeholder_email')}
          visiblePlaceholder={watchEmail ? true : false}
          errorText={errors.email ? errors.email.message || FORM_PATTERNS.email.message : ''}
          {...register("email", { required: t('auth.recover.please_enter_email'), pattern: FORM_PATTERNS.email })}
        />
        <LoadingButton
          loading={isLoading}
          sx={{ marginTop: 3, fontSize: 12, padding: 2 }}
          fullWidth
          type="submit"
          variant="contained"
        >
          {t('auth.recover.send_email')}
        </LoadingButton>
      </form>
      <BackButton to='login' className='backlink'><StyledArrowIcon /> {t('button.back_sign_in')}</BackButton>
      <LanguageContainer>
      <ChangeLanguage/>
      </LanguageContainer>
    </FormContainerTemplate>
  );
};

export default Recover;
const LanguageContainer = styled.div `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
`
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
  & > h3 {
    color: var(--dark-gray);
    margin-top: 20px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    font-size: 1.4rem;
    line-height: 2.2rem;
  }
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

