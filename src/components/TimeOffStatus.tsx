import styled from 'styled-components';

const TimeOffStatus = ({status}: any) => {

    const generateStatusColor = () => {
        if (status && status?.id) {
            if (status?.id === 'open_date') {
                return {
                    border: '1px solid #CECEFF',
                    backgroundColor: '#E4E4FF',
                    color: '#6666FF'
                }
            }
            if (status?.id === 'pending') {
                return {
                    border: '1px solid #F2D7B9',
                    backgroundColor: '#FEF8F0',
                    color: '#CD853E'
                }
            }
            else if (status?.id === 'denied') {
                return {
                    border: '1px solid #E2C9C8',
                    backgroundColor: '#EEE0DF',
                    color: '#CF6461'
                }
            }
            else if (status?.id === 'cancelled') {
                return {
                    border: '1px solid #D9D9D9',
                    backgroundColor: '#E8E8E8',
                    color: '#6F6F6F'
                }
            }
            else if (status?.id === 'approved') {
                return {
                    border: '1px solid #C1DBCE',
                    backgroundColor: '#D7E5DE',
                    color: '#339966'
                }
            }
        }
    }

    return (
        <StatusStyle style={{...generateStatusColor()}}>
            {status?.name}
        </StatusStyle>
    )
}

const StatusStyle = styled.div<{ $type?: any }>`
    border-radius: 10px;
    font-size: 10px;
    min-height: 21px;
    display: flex;
    justify-content: center;
    padding: 0px 11px;
    align-items: center;
    text-align: center;
`;

export default TimeOffStatus;
