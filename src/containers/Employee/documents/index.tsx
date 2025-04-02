import { Fragment, useEffect, useState } from "react";
import { useToasts } from 'react-toast-notifications';
import styled, { css } from "styled-components";
import { uploadDocument, getDocumentList, getDocument, deleteDocument } from "services";
import { formatBytes } from 'utils/common';
import DocumentDelete from './delete';
import CircularProgress from "@mui/material/CircularProgress";
import Button from '@mui/material/Button';
import Tooltip from "@mui/material/Tooltip";
import Backdrop from "@mui/material/Backdrop";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";

import { ReactComponent as SortAscIcon } from 'assets/svg/up-arrow-bold_circle.svg';
import { ReactComponent as UploadIcon } from 'assets/svg/upload-arrow_circle.svg';
import { ReactComponent as DownloadIcon } from 'assets/svg/download-arrow_circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { ReactComponent as Bmp } from 'assets/svg/docs/bmp.svg';
import { ReactComponent as Csv } from 'assets/svg/docs/csv.svg';
import { ReactComponent as Doc } from 'assets/svg/docs/doc.svg';
import { ReactComponent as Docx } from 'assets/svg/docs/docx.svg';
import { ReactComponent as Gif } from 'assets/svg/docs/gif.svg';
import { ReactComponent as Jpeg } from 'assets/svg/docs/jpeg.svg';
import { ReactComponent as Jpg } from 'assets/svg/docs/jpg.svg';
import { ReactComponent as Pdf } from 'assets/svg/docs/pdf.svg';
import { ReactComponent as Png } from 'assets/svg/docs/png.svg';
import { ReactComponent as Rar } from 'assets/svg/docs/rar.svg';
import { ReactComponent as Rtf } from 'assets/svg/docs/rtf.svg';
import { ReactComponent as Tif } from 'assets/svg/docs/tif.svg';
import { ReactComponent as Tiff } from 'assets/svg/docs/tiff.svg';
import { ReactComponent as Txt } from 'assets/svg/docs/txt.svg';
import { ReactComponent as Xls } from 'assets/svg/docs/xls.svg';
import { ReactComponent as Xlsx } from 'assets/svg/docs/xlsx.svg';
import { ReactComponent as Zip } from 'assets/svg/docs/zip.svg';
import { ReactComponent as I9 } from 'assets/svg/docs/i9_form.svg';
import { dateFormat } from "lib/DateFormat";

const MAX_FILE_SIZE = 10_000_000;

const EXT: any = {
  bmp: <Bmp />,
  csv: <Csv />,
  doc: <Doc />,
  docx: <Docx />,
  gif: <Gif />,
  jpeg: <Jpeg />,
  jpg: <Jpg />,
  pdf: <Pdf />,
  png: <Png />,
  rar: <Rar />,
  rtf: <Rtf />,
  tif: <Tif />,
  tiff: <Tiff />,
  txt: <Txt />,
  xls: <Xls />,
  xlsx: <Xlsx />,
  zip: <Zip />,
  i9: <I9 />
};

const DocumentItem = ({ item, onDownloadClick, onDeleteClick, disabled }: any) => {
  const { t } = useTranslation();
  const doc_ext = item.name.split('.').pop();
  const isI9 = item.i9_document;
  const currentUser = useSelector(currentUserSelector);
  const shouldDeleteButtonVisible =
    (currentUser.employee.id === item.created_by.id && !isI9) ||
    !['employee', 'manager'].includes(currentUser.permissions.role);

  return (
    <DocItemContainer>
      <DocumentInfoContainer>
        {isI9 ? EXT['i9'] : EXT[doc_ext]}
        <DocumentNameContainer isI9={isI9}>
          <span>{isI9 ? 'Form I-9' : item.name}</span>
          {isI9 ? <div className='desc'>
            {item.admin_signed_at &&
              <p>{t('employee.documents.signed')} {dateFormat(new Date(item.admin_signed_at), 'shortMonthAndDay')} at {dateFormat(new Date(item.admin_signed_at), 'shortDate')} by {item.admin} ({formatBytes(item.file_size)})</p>}
            <p>{t('employee.documents.signed')} {dateFormat(new Date(item.employee_signed_at), 'shortMonthAndDay')} at {dateFormat(new Date(item.employee_signed_at), 'shortDate')} by {item.employee} ({formatBytes(item.file_size)})</p>
          </div> :
            <div className='desc'>
              {t('employee.documents.added')} {dateFormat(new Date(item.created_at), 'shortMonthAndDay')} at {dateFormat(new Date(item.created_at), 'shortDate')} by {item.created_by.first_name + ' ' + item.created_by.last_name} ({formatBytes(item.file_size)})
            </div>}
          {isI9 && !item.admin_signed_at && <SignatureRequiredLabel>{t('employee.documents.required_admins_signature')}</SignatureRequiredLabel>}
        </DocumentNameContainer>
      </DocumentInfoContainer>

      <div className='actions'>
        <Tooltip title={t('employee.documents.download')} disableInteractive arrow>
          <StyledIcon as={StyledDownloadIcon} onClick={() => onDownloadClick(item.id, item.file_type, item.name)} />
        </Tooltip>
        <PermissionGate action="edit" on="documents" shouldVisible={currentUser.permissions.profile?.documents?.edit}>
          {disabled || !shouldDeleteButtonVisible ? null : <Tooltip title={t('employee.documents.delete')} disableInteractive arrow>
            <StyledIcon as={TrashCanIcon} onClick={() => onDeleteClick(item)} width={23} height={23} />
          </Tooltip>}
        </PermissionGate>
      </div>
    </DocItemContainer>
  )
};

const Documents = ({ person, withoutHeader, disabled, refreshEmployeeInfo }: any) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const [overlayLoading, setOverlayLoading] = useState<boolean>(false);
  const [documentList, setDocumentList] = useState<any>([]);
  const { addToast } = useToasts();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [documentItem, setDocumentItem] = useState<any>(null);
  const [ascOrder, setAscOrder] = useState<"asc" | "desc">("asc");
  const currentUser = useSelector(currentUserSelector)

  useEffect(() => {
    getDocumentList(100, 1, person.id, ascOrder).then(res => {
      setDocumentList(res.data.list);
      setIsLoading(false);
    }).catch(err => setIsLoading(false))
  }, [ascOrder, person.id]);

  const handleFileUpload = (e: any) => {
    if (e.target.files[0].size > MAX_FILE_SIZE) {
      return addToast(t('employee.documents.file_size_warn'), {
        appearance: 'error',
        autoDismiss: true,
        placement: 'top-center'
      });
    };
    if (!e.target.files[0]) {
      return
    }
    const data = new FormData();
    setOverlayLoading(true);
    data.append('file', e.target.files[0], e.target.files[0].name);
    uploadDocument(data, person.id).then(res => {
      setOverlayLoading(false);
      addToast(t('employee.documents.document_successfully_added'), {
        appearance: 'success',
        autoDismiss: true,
      })

      getDocumentList(100, 1, person.id, ascOrder).then(res => {
        setDocumentList(res.data.list);
      })
      e.target.value = null;
    }).catch(err => {
      setOverlayLoading(false);
      addToast(err.response.data.errors[0].message, {
        appearance: 'error',
        autoDismiss: true,
      })
      e.target.value = null;
    });
  }

  const docDownload = (id: number, type: string, name: string) => {
    setOverlayLoading(true);
    getDocument(id).then(res => {
      setOverlayLoading(false);
      if (type === 'application/pdf') {
        let blob = new Blob([res.data], { type: 'application/pdf' }),
          url = window.URL.createObjectURL(blob)

        window.open(url)
      } else {
        setOverlayLoading(false);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', name);
        document.body.appendChild(link);
        link.click();
      }
    }).catch(() => setOverlayLoading(false));
  }

  const docDeletion = () => {
    setLoadingRequest(true);
    deleteDocument(documentItem.id).then(res => {
      if (documentItem.i9_document) refreshEmployeeInfo();
      setLoadingRequest(false);
      let newList = documentList.filter((item: any) => item.id !== res.data.id);
      setDocumentList(newList)
      setIsDeleteOpen(false);
      addToast(t('employee.documents.document_deleted_successfully'), {
        appearance: 'success',
        autoDismiss: true,
      })
    }).catch(err => {
      setLoadingRequest(false);
      addToast(err.response.data.errors[0].message, {
        appearance: 'error',
        autoDismiss: true,
      })
    });
  }

  if (isLoading) {
    return <Wrapper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Wrapper>
  };

  return (
    <Fragment>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
        open={overlayLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Wrapper>
        <div className='document-top'>
          {withoutHeader ? null : <div className='title' onClick={() => setAscOrder(ascOrder === 'asc' ? 'desc' : 'asc')}>
            <span style={{ paddingRight: 5 }}>{t('employee.documents.documents')}</span>
            <StyledSortingArrowIcon order={ascOrder} />
          </div>}
          <PermissionGate action="edit" on="documents" shouldVisible={currentUser.permissions.profile?.documents?.edit}>
            {disabled ? <div style={{ height: 40 }} /> : <Button
              variant="text"
              startIcon={<StyledUploadIcon />}
              title={t('employee.documents.upload')}
              component="label"
              sx={{ marginLeft: 'auto', padding: '10px 12px', color: '#000', fontSize: 12, '&:hover, &:focus': { circle: { fill: '#396' } } }}
            >
              <input type="file" hidden onChange={handleFileUpload}
                accept=".pdf, .png, .jpeg, .docx, .doc, .xls, .xslx, .tif, .tiff, .gif, .txt, .rtf, .zip, .rar, .csv, .docx, .doc, .bmp"
              />
              {t('employee.documents.upload')}
            </Button>}
          </PermissionGate>
        </div>

        {!isLoading && !documentList.length && <div className='no-docs'>{t('employee.documents.no_document_entries_have_been_added')}</div>}

        {documentList && documentList.map((item: any) => <DocumentItem
          key={item.id}
          item={item}
          onDownloadClick={docDownload}
          onDeleteClick={(item: any) => {
            setIsDeleteOpen(true)
            setDocumentItem(item)
          }}
          disabled={disabled}
        />)}

        <DocumentDelete
          isOpen={isDeleteOpen}
          onModalClose={() => {
            setIsDeleteOpen(false)
          }}
          onDelete={docDeletion}
          loadingRequest={loadingRequest}
        />
      </Wrapper>
    </Fragment>
  );
};

export default Documents;

const Wrapper = styled.div`
  min-height: 560px;
  .no-docs{
    padding: 10px 20px;
    font-size: 11px;
    color: #80888D;
  }

  .document-top{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .title {
      text-transform: capitalize;
      display: flex;
      align-items: center;
      color: #172B37;
      cursor: pointer;
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
  }
`;

const StyledUploadIcon = styled(UploadIcon)`
  & circle {
    fill: #B5B5B5;
  }
`;

const StyledSortingArrowIcon = styled(SortAscIcon) <{ order: string }>`
  transform: ${({ order }) => order === 'asc' ? css`rotate(180deg)` : css`rotate(0)`};
  &:hover {
    path {
      fill: #FFF;
    }
    circle {
      fill: #396
    }
  }
`;

const StyledIcon = styled.svg`
  cursor: pointer;
  width: 22px;
  height: 22px;
  &:hover {
    & * circle {
      fill: #396
    }
    path {
      fill: #FFF
    }
  }
`;

const StyledDownloadIcon = styled(DownloadIcon)`
  margin-right: 6px;
  & circle {
      fill: #FFF
  }
  path {
      fill: #172b37
  }
`;

const DocItemContainer = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid #F8F8F8;
  padding: 15px 10px;

  &:hover {
    background: #F8F8F8;

    & > .actions{
      display: flex;
      margin-left: 60px;
    };
  };
  & > .actions{
    display: none;
  };
`;

const DocumentInfoContainer = styled.div`
  display: flex; 
  align-items: center;
  gap: 14;
  svg {
    margin-right: 12px;
    width: 28px;
    height: 28px;
  }
`;

const DocumentNameContainer = styled.div<{ isI9: boolean }>`
  display: flex;
  flex-direction: column;

  & > span {
    font-size: 11px;
    color: ${({ isI9 }) => isI9 ? '#f93' : 'var(--green)'};
    font-weight: 500;
    margin-bottom: 5px;
    display: inline-block;
  };

  &  > .desc{
    display: flex;
    flex-direction: column;
    font-size: 10px;
    color: #414141;
  }
`;

const SignatureRequiredLabel = styled.p`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 21px;
    width: 140px;
    margin-top: 5px;
    border-radius: 10px;
    background-color: rgba(255,153,51, 0.25);
    color: #D16900;
    font-size: 8px;
`;
