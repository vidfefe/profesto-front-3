import styled from 'styled-components';
import { ReactComponent as ErrorIcon } from 'assets/svg/mark_error.svg';
import { ReactComponent as SuccessIcon } from 'assets/svg/mark_success.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-x.svg';

const Wrapper = styled.div`
    margin-top: 10px;
    padding: 20px 35px 20px 20px;
    border-radius:3px 4px 4px 3px;
    min-width: 360px;
    display:flex;
    align-items: center;
    position: relative;
    text-transform: capitalize;

    .close {
        position: absolute;
        top: 10px;
        right: 0px;
        cursor: pointer;
    }


    &.error {
        background: #FDEDEE;
        color: #F46A6A;
        border-left: 2px solid #F46A6A;
    }

    &.success {
        background: #EAF5EB;
        color: #77B448;
        border-left: 2px solid #77B448;
    }

    svg {
        margin-right: 10px;
    }
`;

const CustomToast = ({ appearance, children, onDismiss }: any) => (
    <Wrapper className={appearance}>
        {appearance === 'error' ? <ErrorIcon /> : <SuccessIcon />}
        <span>
            {children}
        </span>
        <span className='close' onClick={onDismiss}>
            {appearance !== 'error' ? <StyledGreenCloseIcon /> : <StyledRedCloseIcon />}
        </span>
    </Wrapper>
);


export default CustomToast;

const StyledRedCloseIcon = styled(CloseIcon)`
    & path {
        fill: #f8aaab;
    }
`;

const StyledGreenCloseIcon = styled(CloseIcon)`
    & path {
        fill: #abd192;
    }
`;