import { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import MuiCheckbox, { CheckboxProps } from '@mui/material/Checkbox';
import styled from '@mui/system/styled';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

interface ICheckbox extends CheckboxProps {
  labelPlacement?: 'bottom' | 'end' | 'start' | 'top',
  label?: ReactElement | string,
  isAbsoluteLink?: boolean,
  labelLink?: string,
  labelLinkText?: string
  errorText?: string | any,
  linkTarget?: '_blank' | '_self' | '_parent' | '_top',
  labelStyle?: CSSProperties,
};

export const CheckBoxRaw = ({ onChange, checked, errorText, ...rest }: ICheckbox) => {
  return (
    <MuiCheckbox
      onKeyDown={(event: any) => {
        if (event.key === 'Enter') {
          onChange?.({ target: { checked: !checked } } as any, !checked);
        }
      }}
      disableRipple
      icon={<BoxIcon />}
      checkedIcon={<BoxCheckedIcon />}
      sx={{ padding: 0, '& > span': { border: errorText ? '1px solid #C54343' : '1px solid #D6D6D6' } }}
      onChange={onChange}
      checked={checked}
      {...rest}
    />
  )
};

export default function Checkbox({
  errorText,
  label,
  isAbsoluteLink,
  labelPlacement,
  labelLink,
  labelLinkText,
  linkTarget = '_blank',
  onChange,
  checked,
  labelStyle,
  ...rest
}: ICheckbox) {
  const formateLabel = (
    <StyledFormateLabel>{`${label} `}
      {isAbsoluteLink ? <a target={linkTarget} rel="noreferrer" href={labelLink ?? '/'}>{labelLinkText}</a> :
        <Link target={linkTarget} rel="noreferrer" to={labelLink ?? '/'}>
          {labelLinkText}
        </Link>
      }
    </StyledFormateLabel>
  );

  return (
    <FormControl variant="standard" error={!!errorText}>
      <FormControlLabel
        sx={{ '& .MuiFormControlLabel-label': { marginLeft: 1 }, marginLeft: 0, ...labelStyle }}
        control={
          <CheckBoxRaw
            errorText={errorText}
            onChange={onChange}
            checked={checked}
            {...rest}
          />
        }
        label={label && labelLink && labelLinkText ? formateLabel : label}
        labelPlacement={labelPlacement}
      />
      {errorText ? <StyledHelperText>{errorText}</StyledHelperText> : null}
    </FormControl>
  );
};

const BoxIcon = styled('span')({
  borderRadius: 4,
  width: 22,
  height: 22,
  backgroundColor: '#FFF',
  '.Mui-focusVisible &': {
    borderColor: '#339966'
  },
  'input:hover:enabled ~ &': {
    borderColor: '#339966'
  },
  'input:disabled ~ &': {
    background: '#D6D6D6',
  },
  'input:checked:enabled ~ &': {
    borderColor: '#339966',
  },
});

const BoxCheckedIcon = styled(BoxIcon)({
  backgroundColor: '#339966',
  '&:before': {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 22,
    height: 22,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='10' viewBox='0 0 12 10'%3E%3Cg transform='translate(-1293 -1336)'%3E%3Crect width='12' height='10' transform='translate(1293 1336)' fill='none'/%3E%3Cg transform='translate(1293.246 1269.277)'%3E%3Cg transform='translate(0 67.997)'%3E%3Cpath d='M11.339 68.166a.575.575 0 0 0-.814 0L3.632 75.06.982 72.41a.575.575 0 0 0-.814.814L3.225 76.28a.576.576 0 0 0 .814 0l7.3-7.3A.575.575 0 0 0 11.339 68.166Z' transform='translate(0 -67.997)' fill='%23fff'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    content: '""',
    backgroundRepeat: 'no-repeat'
  },
});

const StyledHelperText = styled(FormHelperText)`
    font-size: 10px;
    display: inline-block;
    margin-left: -1px;
`;

const StyledFormateLabel = styled('p')`
  color: #9c9c9c;
  & > a {
    text-decoration: underline;
    color: #747474;
    &:hover {
      color: #FF9933;
    }
  }
`;