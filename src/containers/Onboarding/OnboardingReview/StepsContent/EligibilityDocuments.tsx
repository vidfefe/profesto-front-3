import styled from "styled-components";
import { Controller, useFormContext } from "react-hook-form";
import { StepTitle, StepDesc } from "../../StepsContent/Welcome";
import Divider from '@mui/material/Divider';
import useQueryCustom from "hooks/useQueryCustom";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioButton from "components/RadioButton";
import { useTranslation } from "react-i18next";

type TDocLists = {
    class_a: IClass[],
    class_b: IClass[],
    class_c: IClass[],
    underage: IClass[],
};

interface IClass {
    id: number,
    id_name: string,
    name: string,
    description: string,
    i9_class: string,
    selected: boolean
};

export default function EligibilityDocuments({ employeeData }: any) {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext();

    const { data: docLists } = useQueryCustom<string[], {}, TDocLists>(["get_document_lists"], {
        endpoint: `onboarding/admin/documents?employee_id=${employeeData.id}`,
        options: { method: "get" },
        onSuccess: (data) => {
            data.class_a.forEach(e => {
                if (e.selected) {
                    setValue('class_a', e.id);
                }
            });
            data.class_b.forEach(e => {
                if (e.selected) {
                    setValue('class_b', e.id);
                }
            });
            data.class_c.forEach(e => {
                if (e.selected) {
                    setValue('class_c', e.id);
                }
            });
            data.underage.forEach(e => {
                if (e.selected) {
                    setValue('class_b', e.id);
                }
            });
        }
    }, { refetchOnWindowFocus: false });
    // 
    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.eligibilityDocuments.examine_documents')}</StepTitle>
            <StepDesc dangerouslySetInnerHTML={{ __html: t('onBoarding.eligibilityDocuments.to_compete_form_i9')}}/>
            <StepSubTitleContainer>
                <p>{t('onBoarding.eligibilityDocuments.what_documents_employee')}</p>
                <p>{t('onBoarding.eligibilityDocuments.from_list_c')}</p>
            </StepSubTitleContainer>
            <ListsContainer>
                <SingleListContainer>
                    <ListTitleContainer>
                        <p>{t('onBoarding.eligibilityDocuments.list_a')}</p>
                        <p dangerouslySetInnerHTML={{ __html: t('onBoarding.eligibilityDocuments.employment_authorization')}}/>
                    </ListTitleContainer>
                    <Controller
                        control={control}
                        name="class_a"
                        render={({ field }) => (
                            <RadioGroup {...field} onChange={(_, value) => {
                                field.onChange(value);
                                setValue('class_b', '');
                                setValue('class_c', '');
                            }}>
                                {docLists?.class_a.map(item => (
                                    <ListItemContainer key={item.id}>
                                        <StyledFormControlLabel
                                            value={item.id}
                                            control={<RadioButton />}
                                            label={item.description}
                                        />
                                    </ListItemContainer>
                                ))}
                            </RadioGroup>
                        )}
                    />
                </SingleListContainer>
                <Divider orientation="vertical" flexItem sx={{ marginInline: 3 }} />
                <SingleListContainer>
                    <ListTitleContainer>
                        <p>{t('onBoarding.eligibilityDocuments.list_b')}</p>
                        <p dangerouslySetInnerHTML={{ __html: t('onBoarding.eligibilityDocuments.documents_that_establish')}}/>
                    </ListTitleContainer>
                    <Controller
                        control={control}
                        name="class_b"
                        render={({ field }) => (
                            <RadioGroup {...field} onChange={(_, value) => {
                                field.onChange(value);
                                setValue('class_a', '');
                            }}>
                                {docLists?.class_b.map(item => (
                                    <ListItemContainer key={item.id}>
                                        <StyledFormControlLabel
                                            value={item.id}
                                            control={<RadioButton />}
                                            label={item.description}
                                        />
                                    </ListItemContainer>
                                ))}
                                <ListTitleContainer style={{ width: '100%', marginTop: 30 }}>
                                    <p dangerouslySetInnerHTML={{ __html: t('onBoarding.eligibilityDocuments.listed_above')}}/>
                                </ListTitleContainer>
                                {docLists?.underage.map(item => (
                                    <ListItemContainer key={item.id}>
                                        <StyledFormControlLabel
                                            value={item.id}
                                            control={<RadioButton />}
                                            label={item.description}
                                        />
                                    </ListItemContainer>
                                ))}
                            </RadioGroup>
                        )}
                    />
                </SingleListContainer>
                <SingleListContainer>
                    <ListTitleContainer>
                        <p>{t('onBoarding.eligibilityDocuments.list_c')}</p>
                        <p dangerouslySetInnerHTML={{ __html: t('onBoarding.eligibilityDocuments.employment_authorization')}}/>
                    </ListTitleContainer>
                    <Controller
                        control={control}
                        name="class_c"
                        render={({ field }) => (
                            <RadioGroup {...field} onChange={(_, value) => {
                                field.onChange(value);
                                setValue('class_a', '');
                            }}>
                                {docLists?.class_c.map(item => (
                                    <ListItemContainer key={item.id}>
                                        <StyledFormControlLabel
                                            value={item.id}
                                            control={<RadioButton />}
                                            label={item.description}
                                        />
                                    </ListItemContainer>
                                ))}
                            </RadioGroup>
                        )}
                    />
                </SingleListContainer>
            </ListsContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    overflow-y: auto;
    flex: 1;
    padding-top: 60px;
`;

const StepSubTitleContainer = styled.div`
    padding-block: 50px;
    & > p:first-of-type {
        font-size: 13px;
        color: #000;
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        text-align: center;
    };
    & > p:last-of-type {
        font-size: 12px;
        color: #676767;
        text-align: center;
        margin-top: 10px;
    };
`;

const ListsContainer = styled.div`
    display: flex;
    flex: 1;
    margin-right: 60px;
    margin-bottom: 20px;
`;

const SingleListContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-inline: 5px;
    flex: 0 1 33.3%;
`;

const ListTitleContainer = styled.div`
    & > p:first-of-type {
        font-size: 13px;
        color: #339966;
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        text-align: center;
    };
    & > p:last-of-type {
        font-size: 12px;
        font-family: 'Aspira Demi', 'FiraGO Regular';
        color: #000;
        text-align: center;
        margin-top: 10px;
    };
`;

const ListItemContainer = styled.div`
    padding-block: 5px;
`;

const StyledFormControlLabel = styled(FormControlLabel)`
    align-items: flex-start;
    white-space: pre-wrap;
    .MuiFormControlLabel-label { 
        margin-top: 10px 
    }
`;