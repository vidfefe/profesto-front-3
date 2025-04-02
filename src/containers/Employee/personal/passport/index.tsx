import { useEffect, useState } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import PassportInformationEdit from "./edit";
import PassportInformationDelete from './delete';
import Section, { StatusItem } from "../section";
import { getEmployeePassportList, createPassport, deleteEmployeePassport, updatePassport } from 'services';
import { checkDate } from "utils/common";
import { useToasts } from "react-toast-notifications";
import { isEmpty } from "lodash";
import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";
import { dateFormat } from "lib/DateFormat";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
const Wrapper = styled.div``;

const NoData = styled.div`
    padding: 20px 25px;
    font-size: 11px;
    color: #80888D;
`;

const PassportInformation = ({ person, match, onSave, disabled, view}: any) => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [passportList, setPassportList] = useState<any>([]);
    const [passportId, setPassportId] = useState(null);
    const [chosenPassport, setChosenPassport] = useState<any>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        if (match.params.id || person.id) {
            getEmployeePassportList(25, 1, match.params.id ?? person.id).then(res => setPassportList(res.data))
        }

    }, [match.params.id, person.id])

    const handleEditSubmit = (data: any) => {
        if (!editMode) {
            setLoadingRequest(true);
            createPassport(data, person.id).then(res => {
                setLoadingRequest(false);
                getEmployeePassportList(50, 1, person.id).then(res => setPassportList(res.data))
                setIsOpen(false)
                addToast(t('myInfo.passport.added'), {
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
            updatePassport(data, chosenPassport.id).then(res => {
                setLoadingRequest(false);
                getEmployeePassportList(50, 1, person.id).then(res => setPassportList(res.data))
                setChosenPassport(null);
                setIsOpen(false);
                addToast(t('myInfo.passport.updated'), {
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

    const handleDeleteSubmit = () => {
        setLoadingRequest(true);
        deleteEmployeePassport(passportId).then((res: any) => {
            setLoadingRequest(false);
            const filteredList = passportList.filter((item: any) => item.id !== res.data.id)
            setPassportList(filteredList);
            setIsDeleteOpen(false);
            addToast(t('myInfo.passport.deleted'), {
                appearance: 'success',
                autoDismiss: true,
            })
            onSave && onSave();
        });
    }

    const renderStatus = (date: string) => {
        return <StatusItem status={checkDate(date)} />;
    }

    return (
        <Wrapper>
            <Section
                title={t('myInfo.passport.passport_and_other_identification_documents')}
                onEditClick={() => {
                    setChosenPassport(null);
                    setIsOpen(true);
                }}
                rightText={view ? t('globaly.view') : t('globaly.lowercase_add')}
                disabled={disabled}
                view={view}
            >
                {!passportList.length ?
                    <NoData>{t('myInfo.passport.no_added')}</NoData> :
                    <TableContainer style={{ maxWidth: '100%' }}>
                        <Table style={{ width: 'auto' }}>
                            <TableHead>
                                <TableRow>
                                    {region(['geo']) && <TableCell>{t('myInfo.passport.document_type')}</TableCell>}
                                    <TableCell>{region(['geo']) ? t('myInfo.passport.number') : t('myInfo.passport.passport_number')}</TableCell>
                                    <TableCell>{t('myInfo.visa.issuing_country')}</TableCell>
                                    {region(['geo']) &&<TableCell>{t('onBoarding.documentInformation.issuing_authority')}</TableCell>}
                                    <TableCell>{t('myInfo.visa.issued')}</TableCell>
                                    <TableCell>{t('myInfo.visa.expiration')}</TableCell>
                                    <TableCell>{t('myInfo.visa.status')}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    passportList.map((item: any) => 
                                        <TableRow hover key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            {region(['geo']) && <TableCell width={280}>{isEmpty(item.identification_type?.name) ? '-' : item.identification_type.name}</TableCell>}
                                            <TableCell width={280}>{isEmpty(item.number) ? '-' : item.number}</TableCell>
                                            <TableCell width={280}>{isEmpty(item.country?.name) ? '-' : item.country.name}</TableCell>
                                            {region(['geo']) && <TableCell width={280}>{item.issuing_authority ?? '-'}</TableCell>}
                                            <TableCell width={280}>{dateFormat(item.issue_date, 'shortDate') ?? '-'}</TableCell>
                                            <TableCell width={280}>{dateFormat(item.expiration_date, 'shortDate')}</TableCell>
                                            <TableCell width={280}>{renderStatus(item.expiration_date)}</TableCell>
                                            <TableCell width={150}>
                                                <div className="action-block">
                                                    {disabled ? null : <><StyledEditIcon onClick={() => {
                                                        setEditMode(true);
                                                        setChosenPassport(item);
                                                        setIsOpen(true);
                                                    }} />
                                                        <StyledTrashIcon onClick={() => {
                                                            setIsDeleteOpen(true);
                                                            setPassportId(item.id);
                                                        }} /></>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    }

                <PassportInformationDelete
                    isOpen={isDeleteOpen}
                    onModalClose={() => setIsDeleteOpen(false)}
                    onDelete={handleDeleteSubmit}
                    loadingRequest={loadingRequest}
                />

                <PassportInformationEdit
                    isOpen={isOpen}
                    user={person}
                    editMode={editMode}
                    chosenPassport={chosenPassport}
                    jobData={person.active_job_detail}
                    onModalClose={() => {
                        setEditMode(false);
                        setIsOpen(false);
                        setChosenPassport(null);
                    }}
                    onSubmit={handleEditSubmit}
                    editErrors={editErrors}
                    loadingRequest={loadingRequest}
                />
            </Section>
        </Wrapper>
    );
};

export default withRouter(PassportInformation);

const StyledEditIcon = styled(EditIcon)`
  cursor: pointer;
  margin-right: 5px;
`;

const StyledTrashIcon = styled(TrashCanIcon)`
  cursor: pointer;
  margin-right: 0;
`;
