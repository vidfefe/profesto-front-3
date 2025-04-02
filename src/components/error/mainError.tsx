import styled from 'styled-components'
import { ReactComponent as ErrorIcon } from 'assets/svg/mark_error.svg';
import { ReactComponent as WarningIcon } from 'assets/svg/mark_warning.svg';
import { ReactComponent as SuccessIcon } from 'assets/svg/mark_success.svg';

interface ErrorProps {
    type: 'warning' | 'error' | 'success' | string,
    text: string,
    className?: string
}

const ErrorWrapper = styled.div`
    .type{
        display: flex;
        align-items: center;
        border-radius:4px;
        background: var(--gray);
        padding: 10px;
        border-left: 2px solid var(--dark-gray);
        font-size: 12px;
        padding: 16px;
        margin-bottom: 20px;

        svg {
            margin-right: 8px;
        }
    }

    .type-warning{
        color: var(--orange);
        background: var(--light-orange);
        border-left-color: var(--orange);
    }

    .type-error{
        color: var(--light-red);
        background: var(--pink);
        border-left-color: var(--light-red);
    }

    .type-success{
        color: var(--success-green);
        background: var(--light-green);
        border-left-color: var(--success-green);
    }
`;

const renderRelevantIcon = (type: 'warning' | 'error' | 'success' | string) => {
    switch (type) {
        case 'warning': return <WarningIcon />;
        case 'error': return <ErrorIcon />;
        case 'success': return <SuccessIcon />;
        default: return <ErrorIcon />;
    }
};

const MainErrorBox = ({ type, text }: ErrorProps) => {
    return (
        <ErrorWrapper>
            <div className={`type type-${type}`} >
                {renderRelevantIcon(type)}
                <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
            </div>
        </ErrorWrapper>
    )
};

export default MainErrorBox;
