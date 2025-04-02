import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from 'react-dropzone'
import styled from '@mui/system/styled';
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Divider from '@mui/material/Divider';
import SignatureCanvas from 'react-signature-canvas';
import ReactSignatureCanvas from 'react-signature-canvas';
import { useTranslation } from "react-i18next";
import { ReactComponent as ClearIcon } from 'assets/svg/rounding_arrows-circle.svg';

type TSignatureData = {
    signature: File[] | string | undefined | null,
    type: 'draw' | 'text' | 'upload' | null
};

interface ISignatureTypesProps {
    label?: string | JSX.Element,
    required?: boolean,
    activeTab?: 'draw' | 'text' | 'upload',
    value: TSignatureData,
    onChange: (data: TSignatureData) => void,
    helperText?: string | JSX.Element,
    isErrorText?: boolean,
};

export default function SignatureTypes({ label, required, onChange, value, activeTab = 'draw', helperText, isErrorText = false }: ISignatureTypesProps) {
    const { t } = useTranslation();
    const [tab, setTab] = useState<'draw' | 'text' | 'upload'>(activeTab);
    const [somethingDrew, setSomethingDrew] = useState<boolean>(false);
    const canvasRef = useRef<ReactSignatureCanvas>(null);

    useEffect(() => {
        if (activeTab) {
            setTab(activeTab);
        };
    }, [activeTab]);

    useEffect(() => {
        if (value.type === 'draw' && typeof value.signature === 'string' && value.signature) {
            setSomethingDrew(true);
            canvasRef.current?.fromDataURL(value.signature, { width: 600, height: 144 });
        };
        return () => {
            if (value.type === 'upload' && Array.isArray(value.signature) && value.signature) {
                value.signature.forEach((file: any) => URL.revokeObjectURL(file.preview));
            };
        };
    }, [value.signature, value.type]);

    const handleChangeTab = (event: any, newValue: any) => {
        setTab(newValue);
        setSomethingDrew(false);
        onChange({ signature: null, type: null })
    };

    const onEndDraw = () => {
        onChange({ signature: canvasRef.current?.toDataURL('image/png'), type: 'draw' })
    };

    const onChangeSignInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ signature: e.target.value, type: 'text' });
    };

    const onDrop = useCallback(acceptedFiles => {
        onChange({
            signature: acceptedFiles.map((file: File) => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })),
            type: 'upload'
        })
    }, [onChange]);

    const onBeginDraw = () => setSomethingDrew(true);

    const onClearDraw = () => {
        canvasRef.current?.clear();
        setSomethingDrew(false);
        onChange({ signature: '', type: 'draw' });
    };
    const onClearSignInput = () => {
        onChange({ signature: '', type: 'text' });
    };
    const onClearSignPicPreview = () => {
        if (value.type === 'upload' && Array.isArray(value.signature)) {
            value.signature.forEach((file: any) => URL.revokeObjectURL(file.preview));
        };
        onChange({ signature: [], type: 'upload' });
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': [".jpg", ".jpeg", ".png"] },
        maxFiles: 1,
        multiple: false,
    });

    const signPicPreview = Array.isArray(value.signature) && value.signature.map((file: any) => (
        <div key={file.name}>
            <img
                src={file.preview}
                onLoad={() => { URL.revokeObjectURL(file.preview) }}
                alt="signature pic"
            />
        </div>
    ));

    return (
        <Box sx={{ width: 600 }}>
            {label ? <StyledLabel>{label}{required && <sup>*</sup>}</StyledLabel> : null}
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <StyledTabList onChange={handleChangeTab} variant='fullWidth'>
                        <StyledTab label={t('components.signatureComponent.draw')} value="draw" />
                        <StyledTab label={t('components.signatureComponent.type')} value="text" />
                        <StyledTab label={t('components.signatureComponent.upload')} value="upload" />
                    </StyledTabList>
                </Box>
                <StyledTabPanel value="draw">
                    <TypeSignAndUploadContainer>
                        <SignatureCanvas
                            ref={canvasRef}
                            penColor='black'
                            canvasProps={{ width: 600, height: 144 }}
                            onBegin={onBeginDraw}
                            onEnd={onEndDraw}
                        />
                        <ClearButtonContainer onClick={onClearDraw}><ClearIcon />{t('button.clear')}</ClearButtonContainer>
                        <PlaceholderLineContainer>
                            <p>{!somethingDrew ? t('components.signatureComponent.draw_your_signature') : ''}</p>
                            <Divider sx={{ marginInline: 3 }} />
                        </PlaceholderLineContainer>
                    </TypeSignAndUploadContainer>
                </StyledTabPanel>

                <StyledTabPanel value="text">
                    <TypeSignAndUploadContainer>
                        <ClearButtonContainer onClick={onClearSignInput}><ClearIcon />{t('button.clear')}</ClearButtonContainer>
                        <PlaceholderLineContainer style={{ pointerEvents: 'all' }}>
                            <p style={{ marginLeft: 240 }}>{!value.signature ? t('components.signatureComponent.type_your_name') : ''}</p>
                            <input
                                onChange={onChangeSignInput}
                                value={typeof value.signature === 'string' && value.type === 'text' ? value.signature : ''}
                            />
                            <Divider sx={{ marginInline: 3 }} />
                        </PlaceholderLineContainer>
                    </TypeSignAndUploadContainer>
                </StyledTabPanel>

                <StyledTabPanel value="upload">
                    <TypeSignAndUploadContainer>
                        <SignaturePicPreviewContainer>
                            {Array.isArray(value.signature) && value.signature.length && typeof value.signature !== 'string' ?
                                signPicPreview : typeof value.signature === 'string' && <img alt="signature pic" src={value.signature} />}
                        </SignaturePicPreviewContainer>
                        <SignaturePicDropRoot {...getRootProps()}>
                            <input {...getInputProps()} />
                        </SignaturePicDropRoot>
                        <ClearButtonContainer onClick={onClearSignPicPreview}><ClearIcon />{t('button.clear')}</ClearButtonContainer>
                        <PlaceholderLineContainer>
                            <p style={{ marginLeft: 230 }}>
                                {(Array.isArray(value.signature) && value.signature.length) || (typeof value.signature === 'string' && value.type === 'upload')
                                    ? '' : t('components.signatureComponent.upload_your_signature')}
                            </p>
                            <Divider sx={{ marginInline: 3 }} />
                        </PlaceholderLineContainer>
                    </TypeSignAndUploadContainer>
                </StyledTabPanel>
            </TabContext>
            {helperText ? <StyledHelperText error={isErrorText}>{helperText}</StyledHelperText> : null}
        </Box>
    );
};

const StyledTabList = styled(TabList)`
    & .MuiTabs-indicator {
        background-color: #FF9933;
    }
`;

const StyledTab = styled(Tab)`
    color: #00101A;
    text-transform: capitalize;
    font-size: 12px;
    &.Mui-selected {
      color: #FF9933;
    };
    &.Mui-focusVisible {
      background-color: rgba(255, 153, 51, 0.08);
    };
`;

const StyledTabPanel = styled(TabPanel)`
    padding: 10px 0 0 0;
`;

const StyledLabel = styled('label')`
    color: #00101A;
    font-size: 12px;
    & > sup {
        color: #C54343;
    }
`;

const ClearButtonContainer = styled('div')`
    position: absolute;
    top: 7px;
    right: 14px;
    background-color: #FFFCF8;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    color: #364852;
    user-select: none;
    border-radius: 10px;
    padding: 2px 4px;
    & svg {
        margin-right: 5px;
    }
`;

const PlaceholderLineContainer = styled('div')`
    user-select: none;
    pointer-events: none;
    position: absolute;
    right: 0;
    left: 0;
    top: 65px;
    & > p {
        height: 14px;
        user-select: none;
        margin: 0 26px 10px 170px;
        font-size: 12px;
        color: #9C9C9C;
    }
    & > input {
        position: absolute;
        left: 0;
        top: -35px;
        border: 0;
        outline: 0;
        height: 100px;
        width: 550px;
        margin: 0 26px 7.5px 26px;
        background-color: transparent;
        font-family: 'Brooke Smith Regular';
        font-size: 57px;
        text-align: center;
        &::placeholder {
            color: #9C9C9C;
        }
    };
    & > input:focus {
        outline: none!important;
    };
`;

const TypeSignAndUploadContainer = styled('div')`
    position: relative;
    background-color: #FFFCF8;
    width: 600px;
    height: 144px;
`;

const SignaturePicDropRoot = styled('div')`
    position: absolute;
    cursor: pointer;
    height: 120px;
    width: 550px;
    top: 10px;
    left: 25px;
`;

const SignaturePicPreviewContainer = styled('div')`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    & > div {
        display: flex;
        width: auto;
        height: 130px;
    };
    & > img {
        display: block;
        width: auto;
        max-height: 130px;
    }
`;

const StyledHelperText = styled('p') <{ error: boolean }>`
    font-size: ${({ error }) => error ? '12px' : '11px'};
    color: ${({ error }) => error ? '#C54343' : '#636D73'};
    margin-top: 5px;
`;