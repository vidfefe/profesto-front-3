
import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import EducationInformationEdit from "./edit";
import EducationInformationDelete from "./delete";
import Section from "../section";
import {
    createEducation,
    getEmployeeEducation,
    deleteEmployeeEducation,
    updateEducation
} from 'services'
import { useToasts } from "react-toast-notifications";
import { isEmpty } from "lodash";

import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
const Wrapper = styled.div``;

const NoData = styled.div`
    padding: 20px 25px;
    font-size: 11px;
    color: #80888D;
`;

const EducationInformation = ({ person, match, onSave, disabled, view }: any) => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [educationList, setEducationList] = useState<any>([]);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [educationId, setEducationId] = useState<any>(null);
    const [chosenEducation, setChosenEducation] = useState<any>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        if (match.params.id || person.id) {
            getEmployeeEducation(25, 1, match.params.id ?? person.id).then(res => setEducationList(res.data.list));
        }
    }, [match.params.id, person.id])

    const handleEditSubmit = (data: any) => {
        if (editMode) {
            setLoadingRequest(true);
            updateEducation(data, chosenEducation.id).then(res => {
                setLoadingRequest(false);
                setIsOpen(false);
                getEmployeeEducation(25, 1, match.params.id ?? person.id).then(res => setEducationList(res.data.list));
                addToast(t('myInfo.eduction.updated'), {
                    appearance: 'success',
                    autoDismiss: true,
                })
                onSave && onSave();
            }).catch(err => {
                setLoadingRequest(false);
                addToast(<div><span style={{ fontWeight: 'bold' }}> {t('myInfo.visa.there_form')}</span> <span style={{ marginTop: 6, display: 'inline-block' }}>{t('myInfo.visa.please_below')}</span></div>, {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: 'top-center'
                });
                setEditErrors(err.response.data.errors)
            })
        } else {
            setLoadingRequest(true);
            createEducation(data, person.id).then(res => {
                setLoadingRequest(false);
                setIsOpen(false);
                getEmployeeEducation(25, 1, match.params.id ?? person.id).then(res => setEducationList(res.data.list));
                addToast(t('myInfo.eduction.added'), {
                    appearance: 'success',
                    autoDismiss: true,
                })
                onSave && onSave();
            }).catch(err => {
                setLoadingRequest(false);
                addToast(<div><span style={{ fontWeight: 'bold' }}> {t('myInfo.visa.there_form')}</span> <span style={{ marginTop: 6, display: 'inline-block' }}>{t('myInfo.visa.please_below')}</span></div>, {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: 'top-center'
                });
                setEditErrors(err.response.data.errors)
            })
        }

    }

    const handleDeleteSubmit = (data: any) => {
        setLoadingRequest(true);
        deleteEmployeeEducation(educationId).then((res: any) => {
            setLoadingRequest(false);
            const filteredList = educationList.filter((item: any) => item.id !== res.data.id)
            setEducationList(filteredList);
            setIsDeleteOpen(false);
            addToast(t('myInfo.eduction.delete'), {
                appearance: 'success',
                autoDismiss: true,
            })
            onSave && onSave();
        });
    }

    return (
        <Wrapper>
            <Section
                title={t('myInfo.eduction.education')}
                onEditClick={() => {
                    setEditMode(false)
                    setChosenEducation([])
                    setIsOpen(true)
                }}
                rightText={view ? t('globaly.view') : t('globaly.lowercase_add')}
                disabled={disabled}
                view={view}
            >
                {!educationList.length ? <NoData>{t('myInfo.eduction.no_added')}</NoData> : 
                <TableContainer style={{ maxWidth: '100%' }}>
                    <Table style={{ width: 'auto' }}>
                        <TableHead>
                        <TableRow>
                            <TableCell>{t('myInfo.eduction.college_institution')}</TableCell>
                            <TableCell>{t('myInfo.eduction.degree')}</TableCell>
                            <TableCell>{t('myInfo.eduction.major_specialization')}</TableCell>
                            <TableCell>{t('myInfo.eduction.gpa')}</TableCell>
                            <TableCell>{t('myInfo.eduction.start_date')}</TableCell>
                            <TableCell>{t('myInfo.eduction.end_date')}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                educationList.map((item: any) =>
                                    <TableRow hover key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell width={280}>{isEmpty(item.institution) ? '-' : item.institution}</TableCell>
                                        <TableCell width={280}>{item.education_degree?.name ?? '-'}</TableCell>
                                        <TableCell width={280}>{isEmpty(item.specialization) ? '-' : item.specialization}</TableCell>
                                        <TableCell width={280}>{isEmpty(item.gpa) ? '-' : item.gpa}</TableCell>
                                        <TableCell width={280}>{dateFormat(item.start_date, 'shortDate') ?? '-'}</TableCell>
                                        <TableCell width={280}>{dateFormat(item.end_date, 'shortDate') ?? '-'}</TableCell>
                                        <TableCell width={'120px'}>
                                            <div className="action-block">
                                                {disabled ? null : <><StyledEditIcon onClick={() => {
                                                        setChosenEducation(item);
                                                        setIsOpen(true);
                                                        setEditMode(true);
                                                    }} />
                                                <StyledTrashIcon onClick={() => {
                                                    setIsDeleteOpen(true);
                                                    setEducationId(item.id);
                                                }} /></>}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>}

                <EducationInformationDelete
                    isOpen={isDeleteOpen}
                    onModalClose={() => setIsDeleteOpen(false)}
                    onDelete={handleDeleteSubmit}
                    loadingRequest={loadingRequest}
                />

                <EducationInformationEdit
                    isOpen={isOpen}
                    chosenEducation={chosenEducation}
                    user={person}
                    jobData={person.active_job_detail}
                    onModalClose={() => {
                        setEditMode(false)
                        setIsOpen(false)
                    }}
                    onSubmit={handleEditSubmit}
                    editMode={editMode}
                    editErrors={editErrors}
                    loadingRequest={loadingRequest}
                />
            </Section>
        </Wrapper>
    );
};

export default withRouter(EducationInformation);

const StyledEditIcon = styled(EditIcon)`
  cursor: pointer;
  margin-right: 5px;
`;

const StyledTrashIcon = styled(TrashCanIcon)`
  cursor: pointer;
  margin-right: 0;
`;
