import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  GridColDef,
  GridExceljsProcessInput,
  GridInitialState,
  GridLinkOperator,
  GridRenderCellParams,
  GridState,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridPreferencePanelParams,
  GridToolbarQuickFilter,
  GridToolbarExportContainer,
  useGridApiContext,
  useGridApiRef,
  GridExportMenuItemProps,
  GridExcelExportOptions,
  gridFilterModelSelector,
} from "@mui/x-data-grid-premium/";
import LoadingButton from "@mui/lab/LoadingButton";
import MenuItem from "@mui/material/MenuItem";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import queryString from 'query-string';
import DataGrid from "components/DataLists/DataGrid";
import useQuery from "hooks/useQueryCustom";
import EmployeeCard from "components/Employee/Card";
import { PageHeaderTitle } from "components/DesignUIComponents";
import { uniqBy, isEmpty, filter, findIndex } from "lodash";
import format from "date-fns/format";
import { setPeopleDirPath } from "redux/personSlice";
import { saveStorageObject } from "utils/storage";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import ExceededModal from "containers/people/ExceededModal";
import { useTranslation } from "react-i18next";
import { ReactComponent as ListIcon } from 'assets/svg/list-icon.svg';
import { ReactComponent as DirectoryIcon } from 'assets/svg/directory-icon.svg';
import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon.svg';
import { ReactComponent as ActionRequiredIcon } from 'assets/svg/calendar-circle.svg';
import { region } from "lib/Regionalize";
import { changeColumns } from "lib/ChnageColumns";
import { dateFormat } from "lib/DateFormat";
const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
  return params.row[type].first_name ? <EmployeeCard fontSize={12} employee={params.row[type]} /> : "-"
};



const CustomToolbar: React.FunctionComponent<{ setPanelsButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>, openedPanelValue?: string | undefined, isActionRequired?: boolean, }> = ({ setPanelsButtonEl, openedPanelValue, isActionRequired, ...rest }) => {
  const { t } = useTranslation();
  const currentUser = useSelector(currentUserSelector);
  const dispatch = useDispatch();

  const [isFilterSelect, setIsFilterSelected] = useState<boolean>(false);
  const apiRef = useGridApiContext();
  useEffect(() => {
    return apiRef.current.subscribeEvent('stateChange', (
      ({ filter: { filterModel: { items } } }) => setIsFilterSelected(!isEmpty(items))
    ))
  }, [apiRef]);

  const handlePeopleDirectoryChange = (directory: string) => {
    saveStorageObject('people-path', directory);
    dispatch(setPeopleDirPath(directory))
  };

  const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
    workbook.creator = 'Profesto';
    workbook.created = new Date();
    worksheet.properties.defaultRowHeight = 30;

    worksheet.getCell('A1').value = 'People List';
    worksheet.getCell('A1').font = {
      name: 'Arial Black',
      bold: true,
      size: 12,
    };
    worksheet.getCell('A1').alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true,
    };
    worksheet.getCell('A2').value = currentUser.company.name;
    worksheet.getCell('A2').font = {
      name: 'Arial',
      size: 10,
    };
    worksheet.getCell('A3').value = dateFormat(new Date(), 'shortDateAndTime');
    worksheet.getCell('A3').font = {
      name: 'Arial',
      size: 10,
    };
    worksheet.addRow({});
  };

  const exceljsPostProcess = ({ worksheet }: GridExceljsProcessInput): any => {
    worksheet.getRow(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'cccccc' }
    };
    worksheet.getRow(5).font = {
      size: 12,
      bold: true
    };
    worksheet.getRow(5).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    try {
      worksheet.getColumn('pay_amount').alignment = {
        horizontal: 'right',
      };
    } catch {
      return;
    }
  };

  const excelOptions = {
    exceljsPreProcess,
    exceljsPostProcess,
    fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} Profesto - People List`,
  };

  const ExcelExportVariantsMenuItem = (props: GridExportMenuItemProps<{}>) => {
    const apiRef = useGridApiContext();
    const { hideMenu } = props;

    const handleExport = (options: GridExcelExportOptions) => apiRef.current.exportDataAsExcel(options);

    return (
      <>
        <MenuItem onClick={() => { handleExport({ ...excelOptions, allColumns: false }); hideMenu?.(); }}>
          {t('components.dataGrid.visible_columns')}
        </MenuItem>
        <MenuItem onClick={() => { handleExport({ ...excelOptions, allColumns: true }); hideMenu?.(); }}>
          {t('components.dataGrid.all_columns')}
        </MenuItem>
      </>
    );
  };

  const CustomExportButton = ({ ...other }) => (
    <GridToolbarExportContainer
      sx={{ "&:focus": { backgroundColor: "#DCEEE5", color: '#396 !important', circle: { fill: '#396' } } }} {...other}
    >
      <ExcelExportVariantsMenuItem />
    </GridToolbarExportContainer>
  );

  const buttonStyle = (value: string, type?: string) => {
    if (type === 'bg') {
      if (openedPanelValue === value) {
        return '#DCEEE5';
      }
      if (isFilterSelect && value !== 'columns') {
        return '#F2F2F4';
      }
      return 'transparent';
    } else {
      if (openedPanelValue === value) {
        return '#339966';
      }
    }
  };

  let actionRequiredFilterId = gridFilterModelSelector(apiRef).items.find(e => e.columnField === 'action_required')?.id;

  return (
    <GridToolbarContainer {...rest}>
      <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
        <StyledGridToolbarQuickFilter
          placeholder={t('homePage.search_placeholder')}
          variant="outlined"
          size="small"
          debounceMs={500}
        />
        <div style={{ display: 'flex', marginLeft: 20, gap: 10 }}>
          {isActionRequired ? <StyledActionRequiredButton
            type="button"
            isActive={!!actionRequiredFilterId}
            onClick={() => {
              if (!actionRequiredFilterId) {
                apiRef.current.upsertFilterItems([{ columnField: 'action_required', value: 'Yes', operatorValue: 'is', id: 'act_rqr' }]);
              }
            }}
          >
            <ActionRequiredIcon id='required_icon' />
            <span>{isActionRequired}</span>
            {t('homePage.action_required')}
            {actionRequiredFilterId ? <CloseIcon id='close_icon' onClick={(e) => {
              e.stopPropagation();
              apiRef.current.deleteFilterItem({ columnField: 'action_required', id: actionRequiredFilterId });
            }} /> : null}
          </StyledActionRequiredButton> : null}
          <FilterButtonContainer $isFilterSelect={isFilterSelect || openedPanelValue === 'filters'}>
            {isFilterSelect ? <StyledCloseIcon onClick={() => apiRef.current.upsertFilterItems([])} /> : null}
            <GridToolbarFilterButton
              ref={setPanelsButtonEl}
              sx={{
                paddingRight: isFilterSelect ? "30px !important" : '16px',
                backgroundColor: buttonStyle('filters', 'bg'),
                color: isFilterSelect || openedPanelValue === 'filters' ? "#339966 !important" : '#364852',
              }}
            />
          </FilterButtonContainer>
          <GridToolbarColumnsButton
            sx={{
              backgroundColor: buttonStyle('columns', 'bg'),
              circle: { fill: buttonStyle('columns') },
              color: openedPanelValue === 'columns' ? '#396 !important' : '#364852',
            }}
          />
          <CustomExportButton />
          <ListDirectoryButtons>
            <StyledNavLink
              activeClassName="navlink_active"
              to='/list'
              onClick={() => handlePeopleDirectoryChange('list')}
            >
              <ListIcon /><span>{t('components.dataGrid.list')}</span>
            </StyledNavLink>
            <StyledNavLink
              activeClassName="navlink_active"
              to='/people'
              onClick={() => handlePeopleDirectoryChange('people')}
              style={{ borderRadius: '0px 4px 4px 0px', borderLeftWidth: 0 }}
            >
              <DirectoryIcon /><span>{t('components.dataGrid.directory')}</span>
            </StyledNavLink>
          </ListDirectoryButtons>
        </div>
      </div>
    </GridToolbarContainer>
  )
};

const PeopleList = () => {
  const [openedPanelValue, setOpenedPanelValue] = useState<string | undefined>('');
  const [panelsButtonEl, setPanelsButtonEl] = useState<HTMLButtonElement | null>(null);
  const [numberOfEmployees, setNumberOfEmployees] = useState<number>(0);
  const [exceededModal, setExceededModal] = useState<boolean>(false);
  
  const apiRef = useGridApiRef();
  const history = useHistory();
  const { search } = useLocation();
  const queryParams = queryString.parse(search);
  const { t, i18n } = useTranslation();

  const [columns, setColumns] = useState<GridColDef[]>([
  { field: 'employee', headerName: t('employee.employee'), renderCell: (params) => renderAvatarCell(params, 'employee'), valueGetter: ({ value }) => value.first_name ? `${value.first_name} ${value.last_name}` : '', minWidth: 150, flex: 1 },
  { field: 'employee_id', headerName: t('employee.employee_id'), minWidth: 100, flex: 0.6 },
  { field: 'personal_number', headerName: t('employee.personal_number'), minWidth: 150, flex: 1},
  { field: 'remove_mask', headerName: t('globaly.remove_mask'), type: 'boolean', valueFormatter: ({ value }: any) => value ? 'Yes' : "No",  minWidth: 100, flex: 0.6 },

  { field: 'status', headerName: t('employee.status'), type: 'singleSelect', minWidth: 100, flex: 0.6,
    valueOptions: [t('employee.statuses.hiring'), t('employee.statuses.active'), t('employee.statuses.terminated')],
    valueGetter: ({ value }) => value && t('employee.statuses.'+value),
  },
  { field: 'rs_status', headerName: t('leftMenuCard.rsgForm.rsge_status'), type: 'singleSelect', minWidth: 100, flex: 0.6,
    valueOptions: [t('leftMenuCard.rsgForm.terminated'), t('leftMenuCard.rsgForm.active')],
    valueGetter: ({ value }) => value && t('leftMenuCard.rsgForm.'+value),
  },
  { field: 'rs_sync_date', headerName: t('leftMenuCard.rsgForm.last_apdate_status'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value ? dateFormat(new Date(value), 'shortDate') : '', minWidth: 100, flex: 0.6 },
  { field: 'employment_status', headerName: t('employee.employment_status'), minWidth: 100, flex: 1 },
  { field: 'work_type', headerName: t('employee.job.work_type'), minWidth: 100, flex: 1 },
  { field: 'job_title', headerName: t('employee.job.job_title'), minWidth: 100, flex: 1 },
  { field: 'department', headerName: t('employee.job.department'), minWidth: 100, flex: 1 },
  { field: 'division', headerName: t('employee.job.division'), minWidth: 100, flex: 1 },
  { field: 'location', headerName: t('employee.address.location'), minWidth: 100, flex: 1 },
  { field: 'first_name', headerName: t('employee.first_name'), minWidth: 100, flex: 1 },
  { field: 'middle_name', headerName: t('employee.middle_name'), minWidth: 100, flex: 1 },
  { field: 'last_name', headerName: t('employee.last_name'), minWidth: 100, flex: 1 },
  { field: 'preferred_name', headerName: t('employee.preferred_name'), minWidth: 100, flex: 1 },
  { field: 'has_photo', headerName: t('employee.has_photo'), type: 'boolean', valueFormatter: ({ value }) => value ? 'Yes' : "No", minWidth: 100, flex: 0.6 },
  { field: 'birth_date', headerName: t('employee.birth_date'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'), minWidth: 100, flex: 1 }, 
  { field: 'birth_day', headerName: t('employee.birth_day'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => dateFormat(new Date(value), 'shortMonthDay'), minWidth: 100, flex: 0.6 },
  { field: 'age', headerName: t('employee.age'), minWidth: 100, flex: 0.6 },
  { field: 'place_of_birth', headerName: t('employee.place_of_birth'), minWidth: 100, flex: 1 },
  { field: 'gender', headerName: t('employee.gender'), minWidth: 100, flex: 1 },
  { field: 'marital_status', headerName: t('employee.marital_status_name'), minWidth: 100, flex: 1 },
  { field: 'nationality_name', headerName: t('employee.address.nationality_name'), minWidth: 100, flex: 1 },
  { field: 'citizenship_name', headerName: t('employee.address.citizenship_name'), minWidth: 100, flex: 1 },
  { field: 'preferred_language_name', headerName: t('employee.preferred_language_name'), minWidth: 100, flex: 1 },
  { field: 'shirt_size_name', headerName: t('employee.shirt_size_name'), minWidth: 100, flex: 1 },
  { field: 'allergies', headerName: t('employee.allergies'), minWidth: 100, flex: 1 },
  { field: 'dietary_restrictions', headerName: t('employee.dietary_restrictions'), minWidth: 100, flex: 1 },
  { field: 'comment', headerName: t('onBoarding.additional_information'), minWidth: 100, flex: 1 },
  { field: 'home_address_country', headerName: t('employee.address.home_address_country'), minWidth: 100, flex: 1 },
  { field: 'home_address_name', headerName: t('employee.address.home_address_name'), minWidth: 100, flex: 1 },
  { field: 'home_address_details', headerName: t('employee.address.home_address_details'), minWidth: 100, flex: 1 },
  { field: 'home_city', headerName: t('employee.address.home_city'), minWidth: 100, flex: 1 },
  { field: 'home_state', headerName: t('employee.address.home_state'), minWidth: 100, flex: 1 },
  { field: 'home_postal_code', headerName: t('employee.address.home_postal_code'), minWidth: 100, flex: 1 },
  { field: 'mailing_address_country', headerName: t('employee.address.mailing_address_country'), minWidth: 100, flex: 1 },
  { field: 'mailing_address_name', headerName: t('employee.address.mailing_address_name'), minWidth: 100, flex: 1 },
  { field: 'mailing_address_details', headerName: t('employee.address.mailing_address_details'), minWidth: 100, flex: 1 },
  { field: 'mailing_city', headerName: t('employee.address.mailing_city'), minWidth: 100, flex: 1 },
  { field: 'mailing_state', headerName: t('employee.address.mailing_state'), minWidth: 100, flex: 1 },
  { field: 'mailing_postal_code', headerName: t('employee.address.mailing_postal_code'), minWidth: 100, flex: 1 },
  { field: 'work_phone', headerName: t('employee.contact.work_phone'), minWidth: 100, flex: 1 },
  { field: 'work_phone_ext', headerName: t('employee.contact.work_phone_ext'), minWidth: 100, flex: 1 },
  { field: 'mobile_phone', headerName: t('employee.contact.mobile_phone'), minWidth: 100, flex: 1 },
  { field: 'home_phone', headerName: t('employee.contact.home_phone'), minWidth: 100, flex: 1 },
  { field: 'work_email', headerName: t('employee.contact.work_email'), minWidth: 100, flex: 1 },
  { field: 'personal_email', headerName: t('employee.contact.personal_email'), minWidth: 100, flex: 1 },
  { field: 'linkedin', headerName: t('employee.contact.linkedin'), minWidth: 100, flex: 1 },
  { field: 'twitter', headerName: t('employee.contact.twitter'), minWidth: 100, flex: 1 },
  { field: 'facebook', headerName: t('employee.contact.facebook'), minWidth: 100, flex: 1 },
  { field: 'hire_date', headerName: t('employee.job.hire_date'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'), minWidth: 100, flex: 0.6 },
  { field: 'probation_end_date', headerName: t('employee.job.probation_end_date'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'), minWidth: 100, flex: 0.6 }, 
  { field: 'contract_end_date', headerName: t('employee.job.contract_end_date'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'), minWidth: 100, flex: 0.6 }, 
  { field: 'job_effective_date', headerName: t('employee.job.job_effective_date'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'), minWidth: 100, flex: 0.6 }, 
  { field: 'experience', headerName: t('employee.job.experience'), minWidth: 100, flex: 1 }, 
  { field: 'experience_years', headerName: t('employee.job.experience_years'), minWidth: 100, flex: 0.6 }, 
  { field: 'manager', headerName: t('employee.job.manager'), renderCell: (params) => renderAvatarCell(params, 'manager'), valueGetter: ({ value }) => value.first_name ? `${value.first_name} ${value.last_name}` : '', minWidth: 100, flex: 1 }, 
  { field: 'direct_reports', headerName: t('employee.job.direct_reports'), minWidth: 100, flex: 1 }, 
  { field: 'job_change_reason', headerName: t('employee.job.job_change_reason'), minWidth: 100, flex: 1 },
  { field: 'job_change_comment', headerName: t('employee.job.job_change_comment'), minWidth: 100, flex: 1 }, 
  { field: 'termination_date', headerName: t('employee.job.termination_date'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'), minWidth: 100, flex: 0.6 }, 
  { field: 'job_termination_type', headerName: t('employee.job.job_termination_type'), minWidth: 100, flex: 1 }, 
  { field: 'job_termination_reason', headerName: t('employee.job.job_termination_reason'), minWidth: 100, flex: 1 }, 
  { field: 'rehire_eligibility', headerName: t('employee.job.rehire_eligibility'), minWidth: 100, flex: 1 }, 
  { field: 'termination_comment', headerName: t('employee.job.termination_comment'), minWidth: 100, flex: 1 }, 
  { field: 'compensation_effective_date', headerName: t('employee.job.compensation_effective_date'), type: 'date', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'), minWidth: 100, flex: 1 }, 
  { field: 'pay_amount', headerName: t('employee.job.pay_amount'), valueGetter: ({ value }) => Number(value).toFixed(2), type: 'number', minWidth: 100, flex: 1 },
  { field: 'currency', headerName: t('employee.job.currency'), minWidth: 100, flex: 1 },
  { field: 'payment_period', headerName: t('employee.job.payment_period'), minWidth: 100, flex: 1 },
  { field: 'payment_schedule', headerName: t('employee.job.payment_schedule'), minWidth: 100, flex: 1 },
  { field: 'payment_type', headerName: t('employee.job.payment_type'), minWidth: 100, flex: 1 },
  { field: 'overtime_status', headerName: t('employee.job.overtime_status'), minWidth: 100, flex: 1 },
  { field: 'compensation_change_reason', headerName: t('employee.job.compensation_change_reason'), minWidth: 100, flex: 1 },
  { field: 'compensation_comment', headerName: t('employee.job.compensation_comment'), minWidth: 100, flex: 1 },
  {
      field: 'pension_status', headerName: t('jobInfo.pension_status'),
      type: 'singleSelect',
      valueOptions: [t('jobInfo.not_involved'), t('jobInfo.mandatory'), t('jobInfo.voluntary')],
      valueGetter: ({ value }) => value && t(value),
      minWidth: 100, flex: 1
  },
  { field: 'bank_account', headerName: t('jobInfo.bank_account'), minWidth: 100, flex: 1 },
  { field: 'em_contact_name', headerName: t('employee.emergency_contacts.name'), minWidth: 100, flex: 1 },
  { field: 'em_contact_relationship', headerName: t('employee.emergency_contacts.relationship'), minWidth: 100, flex: 1 },
  { field: 'em_contact_work_phone', headerName: t('employee.emergency_contacts.work_phone'), minWidth: 100, flex: 1 },
  { field: 'em_contact_work_phone_ext', headerName: t('employee.emergency_contacts.work_phone_ext'), minWidth: 100, flex: 1 },
  { field: 'em_contact_mobile_phone', headerName: t('employee.emergency_contacts.mobile_phone'), minWidth: 100, flex: 1 },
  { field: 'em_contact_home_phone', headerName: t('employee.emergency_contacts.home_phone'), minWidth: 100, flex: 1 },
  { field: 'em_contact_email', headerName: t('employee.emergency_contacts.email'), minWidth: 100, flex: 1 },
  { field: 'em_contact_country', headerName: t('employee.emergency_contacts.country'), minWidth: 100, flex: 1 },
  { field: 'em_contact_address', headerName: t('employee.emergency_contacts.address'), minWidth: 100, flex: 1 },
  { field: 'em_contact_address_details', headerName: t('employee.emergency_contacts.address_details'), minWidth: 100, flex: 1 },
  { field: 'em_contact_city', headerName: t('employee.emergency_contacts.city'), minWidth: 100, flex: 1 },
  { field: 'em_contact_state', headerName: t('employee.emergency_contacts.state'), minWidth: 100, flex: 1 },
  { field: 'em_contact_postal_code', headerName: t('employee.emergency_contacts.postal_code'), minWidth: 100, flex: 1 },
  { field: 'action_required', headerName: t('validations.action_required'), type: 'singleSelect', valueOptions: ['Yes', 'No'], minWidth: 130, flex: 0.6 },
  { field: 'employee_user_status', headerName: t('employee.employee_user_status'), minWidth: 100, flex: 1 },
  { field: 'role', headerName: t('employee.role'), valueGetter: ({ row }) => row.role_id_name ?  t(`enums.roles.${row.role_id_name}`) : '', minWidth: 100, flex: 1 },
  { field: 'last_login_date', headerName: t('globaly.last_login_date'), type: 'dateTime', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'), minWidth: 100, flex: 0.6 },
  { field: 'join_date', headerName: t('globaly.join_date'), type: 'dateTime', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'), minWidth: 100, flex: 0.6 }, 
  { field: 'created_by', headerName: t('globaly.created_by'), renderCell: (params) => renderAvatarCell(params, 'created_by'), valueGetter: ({ value }) => value.first_name ? `${value.first_name} ${value.last_name}` : '', minWidth: 100, flex: 1, }, 
  { field: 'created_at', headerName: t('globaly.created_at'), type: 'dateTime', valueGetter: ({ value }) => value && new Date(value), valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'), minWidth: 100, flex: 0.6 },])


  useEffect(() => {
    if (region(['eng'])) {
        const newColumns = changeColumns(['personal_number', 'remove_mask'], columns);
        setColumns(newColumns);
    }
}, []);

  useEffect(() => {
    if (!isEmpty(queryParams)) {
      if (queryParams.status === 'none') {
        apiRef.current.deleteFilterItem({ id: 1, columnField: 'status' });
      };
    }
  }, [apiRef, queryParams]);

  const { data, isFetching, refetch } = useQuery<any>(["subscription_info_on_press"], {
    endpoint: 'billing/subscription',
    options: { method: "get" },
  }, { enabled: false });

  const onClickNewEmployeeCreate = async () => {
    const { data } = await refetch();
    if (data?.status && data?.status !== 'trialing' && data?.employee_count >= data?.count) {
      setExceededModal(true);
    } else {
      history.push('/createperson');
    }
  };

  const { data: employeeList = [], isLoading } = useQuery<any>(["employee_list"], {
    endpoint: 'employee_list',
    options: { method: "get" },
  }, { enabled: true });

  const initialState: GridInitialState = {
    filter: {
      filterModel: {
        items: [{ id: 1, columnField: 'status', operatorValue: 'isAnyOf', value: [t('employee.statuses.hiring'), t('employee.statuses.active')] }],
        linkOperator: GridLinkOperator.And,
        quickFilterLogicOperator: GridLinkOperator.And,
      },
    },
    columns: {
      columnVisibilityModel: {
        first_name: false,
        middle_name: false,
        last_name: false,
        preferred_name: false,
        remove_mask: false,
        has_photo: false,
        birth_date: false,
        birth_day: false,
        age: false,
        place_of_birth: false,
        gender: false,
        marital_status_name: false,
        nationality_name: false,
        citizenship_name: false,
        preferred_language_name: false,
        secondary_language_name: false,
        shirt_size_name: false,
        allergies: false,
        dietary_restrictions: false,
        comment: false,
        home_address_country: false,
        home_address_name: false,
        home_address_details: false,
        home_city: false,
        home_state: false,
        home_postal_code: false,
        mailing_address_country: false,
        mailing_address_name: false,
        mailing_address_details: false,
        mailing_city: false,
        mailing_state: false,
        mailing_postal_code: false,
        work_phone: false,
        work_phone_ext: false,
        mobile_phone: false,
        home_phone: false,
        work_email: false,
        personal_email: false,
        linkedin: false,
        twitter: false,
        facebook: false,
        hire_date: false,
        probation_end_date: false,
        contract_end_date: false,
        job_effective_date: false,
        experience: false,
        manager: false,
        experience_years: false,
        direct_reports: false,
        job_change_reason: false,
        job_change_comment: false,
        termination_date: false,
        job_termination_type: false,
        job_termination_reason: false,
        rehire_eligibility: false,
        termination_comment: false,
        compensation_effective_date: false,
        pay_amount: false,
        currency: false,
        payment_period: false,
        payment_schedule: false,
        payment_type: false,
        overtime_status: false,
        compensation_change_reason: false,
        compensation_comment: false,
        em_contact_name: false,
        em_contact_relationship: false,
        em_contact_work_phone: false,
        em_contact_work_phone_ext: false,
        em_contact_mobile_phone: false,
        em_contact_home_phone: false,
        em_contact_email: false,
        em_contact_country: false,
        em_contact_address: false,
        em_contact_address_details: false,
        em_contact_city: false,
        em_contact_state: false,
        em_contact_postal_code: false,
        action_required: false,
        employee_user_status: false,
        role: false,
        last_login_date: false,
        join_date: false,
        created_by: false,
        created_at: false,
      }
    }
  };

  const onGridStateChange = ({ filter: { filteredRowsLookup }, rows: { idRowsLookup } }: GridState) => {
    if (!isEmpty(filteredRowsLookup)) {
      const filteredRowsIds = Object.keys(filteredRowsLookup).filter(key => filteredRowsLookup[key]);
      let rows = Object.keys(idRowsLookup).map((key) => filteredRowsIds.includes(key) && idRowsLookup[key]).filter((row => row));
      let numberOfEmployees = uniqBy(rows, 'employee_id').length;
      setNumberOfEmployees(numberOfEmployees)
    } else {
      let numberOfEmployees = uniqBy(employeeList, 'employee_id').length;
      setNumberOfEmployees(numberOfEmployees)
    }
  };

  let isActionRequired = employeeList.filter((e: any) => e.action_required === 'Yes').length;

  return (
    <div>
      <PageHeaderTitle
        title={t(numberOfEmployees > 1 ?  'homePage.people_records_plural' : 'homePage.people_records', {count: numberOfEmployees})}
        rightSide={<LoadingButton
          type="button"
          size='large'
          variant='contained'
          onClick={onClickNewEmployeeCreate}
          loading={isFetching}
        >+ {t('homePage.new_employee')}</LoadingButton>}
      />
      <DataGridContainer>
        <DataGrid
          name="people_list"
          saveGridState
          apiRef={apiRef}
          disableRowGrouping
          onStateChange={onGridStateChange}
          loading={isLoading}
          initialState={initialState}
          columns={columns}
          rows={employeeList}
          onPreferencePanelClose={() => setOpenedPanelValue('')}
          onPreferencePanelOpen={(e: GridPreferencePanelParams) => setOpenedPanelValue(e.openedPanelValue)}
          components={{
            Toolbar: CustomToolbar,
            QuickFilterClearIcon: CloseIcon,
            QuickFilterIcon: StyledMagnifierIcon
          }}
          componentsProps={{
            panel: {
              anchorEl: panelsButtonEl,
              placement: 'bottom'
            },
            toolbar: {
              setPanelsButtonEl,
              openedPanelValue,
              isActionRequired
            },
          }}
        />
      </DataGridContainer>
      <ExceededModal
        open={exceededModal}
        onClose={() => setExceededModal(false)}
        subscriptionData={data}
      />
    </div>
  );
};

export default PeopleList;

const DataGridContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '85%',
  margin: '14px 60px',
  [theme.breakpoints.down('md')]: {
    margin: "14px 20px",
  },
  [theme.breakpoints.down('sm')]: {
    margin: "14px 16px",
  },
}));

const ListDirectoryButtons = styled.div`
  display: flex;
`;

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: 140,
  height: 40,
  border: "1px solid #DCEEE5",
  borderRadius: "4px 0px 0px 4px",
  justifyContent: "center",
  [theme.breakpoints.down('lg')]: {
    width: 40,
    '& > span': {
      display: 'none'
    },
  },
  '& > span': {
    color: '#364852',
    fontSize: 12,
    marginLeft: 5,
  },
  '&:hover': {
    backgroundColor: '#DCEEE5',
    color: '#339966',
    '& path': {
      fill: '#339966',
    }
  },
  '&.navlink_active': {
    '& > span': {
      color: '#339966',
    },
    backgroundColor: '#DCEEE5',
    '& path': {
      fill: '#339966',
    },
  }
}));

const StyledCloseIcon = styled(CloseIcon)`
    position: absolute;
    z-index: 2;
    right: 10px;
    top: 15px;
    width: 8px;
    height: 8px;
    cursor: pointer;
    & path {
        fill: #868686;
    }
`;

const FilterButtonContainer = styled.div<{ $isFilterSelect: boolean }>`
    position: relative;
    ${StyledCloseIcon}:hover + .MuiButtonBase-root{
        background-color: #DCEEE5;
    }
    & circle { 
        fill: ${({ $isFilterSelect }) => $isFilterSelect ? '#339966' : '#b5b5b5'}
    }
`;

const StyledGridToolbarQuickFilter = styled(GridToolbarQuickFilter)(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  maxWidth: 440,
  [theme.breakpoints.down('lg')]: {
    width: 170,
  },
  [theme.breakpoints.down('sm')]: {
    width: 40,
  },
  '& input': { padding: '10px 5px' },
  '.MuiButtonBase-root': {
    padding: '5px !important',
    '&:hover': {
      backgroundColor: 'transparent !important',
      'path': { fill: '#636363 !important' }
    },
  },
}));

const StyledActionRequiredButton = styled('button')<{ isActive: boolean }>(({ theme, isActive }) => ({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 38,
  paddingInline: 15,
  border: isActive ? '1px solid #FFF0E2' : '1px solid #E5E8E9',
  borderRadius: 4,
  backgroundColor: isActive ? '#FFF7EF' : '#FFF',
  color: isActive ? '#FF9933' : '#364852',
  fontSize: 12,
  [theme.breakpoints.down('md')]: {
    fontSize: 0,
  },
  cursor: "pointer",
  transition: "background-color 250ms cubic-bezier(0.4,0,0.2,1) 0ms",
  "& > #required_icon": {
    marginRight: 5,
    "path:first-of-type": {
      fill: isActive ? '#FF9933' : '#b5b5b5',
    },
  },
  "& > #close_icon": {
    marginLeft: 9,
    width: 8,
    height: 8,
    "& path": {
      fill: '#868686'
    },
  },
  "& > span": {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 12,
    width: 12,
    fontSize: 7,
    borderRadius: 6,
    backgroundColor: "#FFF",
    color: isActive ? '#D0761D' : '#364852',
    top: 2,
    left: 29,
  },
  "&:hover": {
    borderColor: "#FFF0E2",
    backgroundColor: "#FFF7EF",
    color: "#FF9933",
    "& > span": { color: "#D0761D" },
    "& > #required_icon": { "path:first-of-type": { fill: "#FF9933" } }
  }
}));

const StyledMagnifierIcon = styled(MagnifierIcon)`
  min-width: 15px;
  min-height: 15px;
`;