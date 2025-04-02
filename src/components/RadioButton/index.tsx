import Radio, { RadioProps } from '@mui/material/Radio';
import styled from '@mui/system/styled';

export default function RadioButton(props: RadioProps) {
    return (
        <Radio
            disableRipple
            sx={{
                '&:hover': {
                    bgcolor: 'transparent',
                },
            }}
            icon={<BpIcon />}
            checkedIcon={<BpCheckedIcon />}
            {...props}
        />
    )
};

const BpIcon = styled('span')(() => ({
    borderRadius: '50%',
    width: 23,
    height: 23,
    border: '1px solid #D6D6D6',
    backgroundColor: '#FFF',
    '.Mui-focusVisible &': {
        outline: '1px auto #339966',
        outlineOffset: 1,
    },
    'input:disabled ~ &': {
        background: '#f0f0f0',
    },
}));

const BpCheckedIcon = styled(BpIcon)({
    backgroundColor: '#FFF',
    border: '1px solid #339966',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:before': {
        borderRadius: '50%',
        width: 13,
        height: 13,
        backgroundColor: '#339966',
        content: '""',
    },
});