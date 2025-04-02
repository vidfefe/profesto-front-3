import { isEmpty } from "lodash";
import { axiosInstance } from "./axios";
import { MainAxiosInstance } from './mainAxios';
import axios from 'axios';
import {
  AdditionalEarning,
  Deduction,
  PaymentType,
  PaymentTypeCategory,
  PaymentTypeClass,
  Role,
  TimesheetTimesInput,
  PaymentDocumentAdditionalMutationInput,
  PaymentDocumentMutationPayload,
  PaymentDocumentPayTypeMutationInput,
  PaymentDocumentDeductionMutationInput,
  PaymentDocumentDeductionsMutationPayload,
  ActiveEmployeeInput,
  AdvancePaymentAmountMutationInput,
  AdvancePaymentPayload,
  AdvanceDeductionMutationInput,
  AdvanceDeductionMutationPayload,
  CompanyPermissionSettings,
} from "types";
import { TFunction } from "i18next";
import { sortBy } from 'lodash';
import { deleteToken } from "utils/storage";

// Auth Services
export async function LoginService(email: string, password: string, company?: any) {

  return await axiosInstance.post(`/auth`, {
    email,
    password,
    company
  });
}

export async function UpdateLocales(param: string) {
  return await MainAxiosInstance.post(`/locale`, {
    locale: param
  });
}

export async function LogoutService(token: string) {
  return await axios.delete(`${process.env.REACT_APP_AUTH_API_URL}/auth`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

export async function RegisterService(data: any) {
  return await axiosInstance.post("/registration/sign_up", {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password: data.password,
    company_name: data.company_name,
    phone_number: data.phone_number,
    number_of_employee_id: data.number_of_employee,
    country_id: data.country.id,
    terms: data.terms,
    captcha: data.token,
    plan: data.plan,
    interval: data.interval
  });
}

export async function ConfirmRegisterTokenService(token: string | string[]) {
  return await axiosInstance.post(`/registration/confirm/${token}`);
}


export async function createUnlockRequest(email: string) {
  return await axiosInstance.post("/unlock/create", {
    email
  });
}

export async function confirmUnlockRequest(token: string | string[]) {
  return await axiosInstance.post(`/unlock/confirm_unlock/${token}`, {});
}

export async function RecoverPasswordService(email: string) {
  return await axiosInstance.post("/password/forgot", {
    email
  });
}

export async function ResetPasswordService(token: any, password: string) {
  return await axiosInstance.post("/password/set", {
    token,
    password
  });
}

export async function confirmInviteTokenService(token: any, password: any) {
  return await axiosInstance.post("invite/confirm", {
    token,
    password
  });
}

export async function checkInviteToken(token: any) {
  return await axiosInstance.get(`/invite/check_invite?token=${token}`);
}

export async function SendEmailAgain(email: string) {
  return await axiosInstance.post("/unlock/create", {
    email
  });
}

export async function checkRecoveryToken(token: any) {
  return await axiosInstance.get(`/password/recovery?token=${token}`);
}

export async function getCurrentUser() {
  return await MainAxiosInstance.get(`/user/current`).catch(
    err => {
      if(err.response.status === 403) {
        deleteToken();
        window.location.reload();
      }
      return err.response;
    }
  );
}

export async function getCountryList(page_limit?: number, page?: number, input_text?: string) {
  const queryStr = input_text ? `page_limit=${page_limit}&page=${page}&input_text=${input_text}` : `page_limit=${page_limit}&page=${page}`;
  return await MainAxiosInstance.get(`/country?${queryStr}`);
}

export async function getRegistrationCountryList(page_limit?: number, page?: number, input_text?: string) {
  const queryStr = input_text ? `page_limit=${page_limit}&page=${page}&input_text=${input_text}` : `page_limit=${page_limit}&page=${page}`;
  return await axiosInstance.get(`/registration/countries?${queryStr}`);
}

export async function getStateList(page_limit?: number, page?: number) {
  return await MainAxiosInstance.get(`/state?page_limit=${page_limit}&page=${page}`);
}

export async function getBenefitTypeList(page_limit?: number, page?: number) {
  return await MainAxiosInstance.get(`/benefit_type?page_limit=${page_limit}&page=${page}`);
}

export async function getNumberOfEmployees() {
  return await axiosInstance.get("/registration/number_of_employees");
}

export async function getEmployeeDirectory(page_limit: number, page: number) {
  return await axiosInstance.get(`/employee_directory?page=${page}&page_limit=${page_limit}`);
}


export async function getEmployeeSubordinates(page_limit: number, page: number, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_subordinate?page=${page}&page_limit=${page_limit}&employee_id=${employee_id}`);
}


export async function getEnum(model_name: string) {
  return await MainAxiosInstance.get(`/enum/list?model_name=${model_name}`);
}


export async function getPaymentSchedule(page_limit: number = 25, page: number = 1, allRecords: boolean = false) {
  return await MainAxiosInstance.get(`/payment_schedule?page=${page}&page_limit=${page_limit}&all_records=${allRecords}`);
}

export async function getTimeOffRequestTypes(page_limit: number = 25, page: number = 1, allRecords: boolean = false, has_time_off_rule: boolean = false) {
  return await MainAxiosInstance.get(`/time_off_type?page=${page}&page_limit=${page_limit}&all_records=${allRecords}&has_time_off_rule=${has_time_off_rule}`);
}


export async function createShirtSize(name: string) {
  return await MainAxiosInstance.post(`/shirt_size`, {
    name: name
  });
}


export async function getPaymentPeriod(page_limit: number = 25, page: number = 1, allRecords: boolean = false, payClass?: PaymentTypeClass) {
  return await MainAxiosInstance.get(`/payment_period?page=${page}&page_limit=${page_limit}&all_records=${allRecords}${payClass ? `&payment_type_class=${payClass}` : ''}`);
}

/************ Department  **************/
export async function createDepartment(name: string) {
  return await MainAxiosInstance.post(`/department`, {
    name: name
  });
}


export async function getDepartments(page_limit: number = 25, page: number = 1, allRecords: boolean = false) {
  return await MainAxiosInstance.get(`/department?page=${page}&page_limit=${page_limit}&all_records=${allRecords}`)
}


export async function createDivision(name: string) {
  return await MainAxiosInstance.post(`/division`, {
    name: name
  });
}

export async function getDivisions(page_limit: number = 25, page: number = 1, allRecords: boolean = false) {
  return await MainAxiosInstance.get(`/division?page=${page}&page_limit=${page_limit}&all_records=${allRecords}`)
}


export async function createJobTitle(name: string) {
  return await MainAxiosInstance.post(`/job_title`, {
    name: name
  });
}

export async function createBenefitType(name: string) {
  return await MainAxiosInstance.post(`/benefit_type`, { name });
}

export async function getJobTitles(page_limit: number = 25, page: number = 1, allRecords: boolean = false) {
  return await MainAxiosInstance.get(`/job_title?page=${page}&page_limit=${page_limit}&all_records=${allRecords}`)
}


export async function createLocation(data: any) {
  let formData = {
    name: data.name,
    remote_location: data.remote_location,
    country_id: data.country?.id,
    address: data.address,
    address_details: data.address_details,
    city: data.city,
    region: data.region,
    state_id: data.state?.id,
    postal_code: data.postal_code
  };

  return await MainAxiosInstance.post('/location', formData);
}

export async function createPaymentSchedule(name: string) {
  return await MainAxiosInstance.post(`/payment_schedule`, {
    name: name
  });
}

export async function getLocations(page_limit: number = 25, page: number = 1, allRecords: boolean = false, remote_location: boolean | undefined = undefined) {
  return await MainAxiosInstance.get(`/location?page=${page}&page_limit=${page_limit}&all_records=${allRecords}${remote_location === undefined ? '' : '&remote_location=' + remote_location}`)
}


export async function createLanguage(name: string) {
  return await MainAxiosInstance.post(`/language`, {
    name: name
  });
}

export async function createJobChangeReason(name: string) {
  return await MainAxiosInstance.post(`/job_change_reason`, {
    name: name
  });
}

export async function createTerminationType(name: string) {
  return await MainAxiosInstance.post(`/job_termination_type`, {
    name: name
  });
}

export async function createTerminationReason(name: string) {
  return await MainAxiosInstance.post(`/job_termination_reason`, {
    name: name
  });
}

export async function createEmployee(data: any) {
  const home_address = data.country_home && {
    country_id: data.country_home?.id ?? null,
    address_type: 'home_address',
    address: data.address_home,
    address_details: data.address_details_home,
    city: data.city_home,
    region: data.region_home,
    state_id: data.state_home?.id ?? null,
    postal_code: data.postal_code_home
  }

  const mailing_address = data.addresses_are_same ?
    { ...home_address, ...{ address_type: 'mailing_address' } } : data.country_mailing && {
      country_id: data.country_mailing?.id ?? null,
      address_type: 'mailing_address',
      address: data.address_mailing,
      address_details: data.address_details_mailing,
      city: data.city_mailing,
      state_id: data.state_mailing?.id ?? null,
      region: data.region_mailing,
      postal_code: data.postal_code_mailing
    }

  return await MainAxiosInstance.post(`/employee`, {
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    personal_number: data.personal_number,
    remove_mask: data.remove_mask,
    preferred_name: data.preferred_name,
    birth_date: data.birth_date,
    gender: data.gender ?? null,
    marital_status: data.marital_status ?? null,
    ssn: data.ssn,
    invite: data.invite,
    onboarding: data.onboarding,
    i9_form: data.i9_form,
    hire_date: data.hire_date,
    role_id: data.role?.id ?? null,
    employee_addresses_attributes: [home_address, mailing_address],
    user_email: data.user_email,
    employee_contact_info_attributes: {
      work_phone: data.work_phone,
      work_phone_ext: data.work_phone_ext,
      mobile_phone: data.mobile_phone,
      home_phone: data.home_phone,
      work_email: data.work_email,
      personal_email: data.personal_email
    },
    employee_job_details_attributes: [
      data.effective_date && {
        effective_date: data.effective_date,
        employment_status_id: data.employment_status?.id ?? null,
        work_type: data.work_type ?? null,
        location_id: data.location?.id ?? null,
        division_id: data.division?.id ?? null,
        department_id: data.department?.id ?? null,
        job_title_id: data.job_title?.id ?? null,
        manager_id: data.manager?.id ?? null
      }
    ],
    employee_compensations_attributes: [
      data.effective_date_compensation && {
        effective_date: data.effective_date_compensation,
        pay_amount: data.pay_amount?.inputValue,
        currency_id: data.pay_amount?.selectValue?.id,
        payment_period_id: data.payment_period?.id ?? null,
        payment_schedule_id: data.payment_schedule?.id ?? null,
        payment_type_id: data.payment_type?.id ?? null,
        additional_payment_type_ids: data.additional_payment_types,
      }
    ],
    job_additional_information_attributes: {
        pension_status: data.pension_status ?? null,
        bank_account: data.bank_account ?? null
      }
  });
}



export async function updateEmployee(id: number, data: any) {
  const languageIds = data.employee_languages.map((item: any) => { return { language_id: item.language?.id ?? item.id } })

  return await MainAxiosInstance.put(`/employee/${id}`, {
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    preferred_name: data.preferred_name,
    place_of_birth: data.place_of_birth,
    birth_date: data.birth_date,
    gender: data.gender,
    marital_status: data.marital_status,
    ssn: data.ssn,
    personal_number: data.personal_number,
    remove_mask: data.remove_mask,
    nationality_id: data.nationality?.id ?? null,
    citizenship_id: data.citizenship?.id ?? null,
    preferred_language_id: data.preferred_language?.id ?? null,
    employee_languages_attributes: languageIds
  });
}

export async function deleteEmployee(id: number) {
  return await MainAxiosInstance.delete(`/employee/${id}`);
}

// Currencies
export async function getCurrencies(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/currency?page=${page}&page_limit=${page_limit}`)
}

export async function getCurrency(id: number) {
  return await MainAxiosInstance.get(`/currency/${id}`);
}

// language

export async function getLanguages(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/language?page=${page}&page_limit=${page_limit}`)
}



// Employee list
export async function getEmployeeList(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/employee_directory?page=${page}&page_limit=${page_limit}`)
}


export async function getManagerList(page_limit: number = 25, page: number = 1, excludeEmployeeId: number | undefined = undefined) {
  return await MainAxiosInstance.get(`/select_manager?page=${page}&page_limit=${page_limit}${excludeEmployeeId === undefined ? '' : '&exclude_employee=' + excludeEmployeeId}`)
}

export async function getTimeOffRecipuentList(page_limit: number = 25, page: number = 1, excludeEmployeeId: number | undefined = undefined) {
  return await MainAxiosInstance.get(`/select_time_off_recipient?page=${page}&page_limit=${page_limit}${excludeEmployeeId === undefined ? '' : '&exclude_employee=' + excludeEmployeeId}`)
}




export async function getEmployee(id: number) {
  return await MainAxiosInstance.get(`/employee_info/main/`, {
    params: {
      employee_id: id
    }
  })
}

export async function getWorkingDays(from: Date | string, to: Date | string, requested_hours: number, employeeInfo: any, timeOffType: any) {
  return await MainAxiosInstance.get(`/time_off/work_days`, {
    params: {
      requested_hours: requested_hours,
      date_from: from,
      date_to: to,
      employee_id: employeeInfo?.id,
      time_off_type_id: timeOffType?.id
    }
  })
}

export async function getEmployeeWithId(id: number) {
  return await MainAxiosInstance.get(`/employee/${id}`,)
}


export async function getPaymentTypes(
  page_limit: number = 25,
  page: number = 1,
  allRecords: boolean = false,
  category: PaymentTypeCategory = PaymentTypeCategory.REGULAR
) {
  return await MainAxiosInstance.get<{ count: number; list: PaymentType[] }>(
    `/payment_type?page=${page}&page_limit=${page_limit}&all_records=${allRecords}&category=${category}`
  );
}

export async function getPaymentType(id: number) {
  return await MainAxiosInstance.get<PaymentType>(`/payment_type/${id}`);
}

// Profile Photo
export async function uploadProfilePhoto(formData: any, exists?: boolean) {

  if (exists) {
    return await MainAxiosInstance.put(`/employee_photo?version=small`, formData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  } else {
    return await MainAxiosInstance.post(`/employee_photo`, formData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

}

export async function deleteProfilePhoto(id: number) {
  return await MainAxiosInstance.delete(`/employee_photo`, {
    data: {
      employee_id: id
    }
  });
}

export async function getEmployeePhoto(employee_id: number, small: boolean) {
  return await MainAxiosInstance.get(`/employee_photo?employee_id=${employee_id}&small=${small}`,)
}




export async function getProfile(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_photo?employee_id=${employee_id}&small=${true}`,)
}


export async function getJobDetails(id: number) {
  return await MainAxiosInstance.get(`/employee_job_detail/${id}`,)
}

export async function getActiveJobDetails(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_job_detail/active?employee_id=${employee_id}`,)
}




// Contact Info
export async function getContactInformation(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_contact_info/${employee_id}`,)
}

export async function getContactEmails(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_contact_info/emails?employee_id=${employee_id}`,)
}

export async function updateContactInformation(employee_id: number, data: any) {
  return await MainAxiosInstance.put(`/employee_contact_info/${employee_id}`, {
    work_phone: data.work_phone,
    work_phone_ext: data.work_phone_ext,
    mobile_phone: data.mobile_phone,
    home_phone: data.home_phone,
    work_email: data.work_email,
    personal_email: data.personal_email,
    linkedin: data.linkedin,
    twitter: data.twitter,
    facebook: data.facebook
  })
}

// Addresses
export async function getEmployeeAddress(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_address/${employee_id}`,)
}

export async function updateEmployeeAddress(employee_id: number, data: any) {
  return await MainAxiosInstance.put(`/employee_address/${employee_id}`, {
    employee_addresses: [
      {
        address_type: 'home_address',
        country_id: data.country_home?.id,
        address: data.address_home,
        address_details: data.address_details_home,
        city: data.city_home,
        state_id: data.state_home?.id ?? null,
        region: data.region_home,
        postal_code: data.postal_code_home,
        _destroy: !data.country_home?.id
      },
      {
        address_type: 'mailing_address',
        country_id: data.country_mailing?.id,
        address: data.address_mailing,
        address_details: data.address_details_mailing,
        city: data.city_mailing,
        state_id: data.state_mailing?.id ?? null,
        region: data.region_mailing,
        postal_code: data.postal_code_mailing,
        _destroy: !data.country_mailing?.id
      }
    ]
  })
}

// Visa 
export async function createEmployeeVisa(data: any, employee_id: number) {
  return await MainAxiosInstance.post(`/employee_visa?employee_id=${employee_id}`, {
    visa_id: data.visa?.id,
    issuing_country_id: data.issuing_country?.id,
    issue_date: data.issue_date,
    expiration_date: data.expiration_date,
    note: data.note
  });
}

export async function updateVisa(data: any, visa_id: number) {
  return await MainAxiosInstance.put(`/employee_visa/${visa_id}`, {
    visa_id: data.visa?.id ?? null,
    issuing_country_id: data.issuing_country.id ?? null,
    issue_date: data.issue_date,
    expiration_date: data.expiration_date,
    note: data.note
  });
}

export async function getEmployeeVisaList(page_limit: number = 25, page: number = 1, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_visa/?page=${page}&page_limit=${page_limit}&employee_id=${employee_id}`,)
}


export async function getVisaList(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/visa/?page=${page}&page_limit=${page_limit}`,)
}

export async function createVisa(name: string) {
  return await MainAxiosInstance.post(`/visa`, {
    name: name
  });
}

export async function deleteEmployeeVisa(visa_id: any) {
  return await MainAxiosInstance.delete(`/employee_visa/${visa_id}`,)
}

// Passport

export async function createPassport(data: any, employee_id: number) {
  return await MainAxiosInstance.post(`/employee_passport?employee_id=${employee_id}`, {
    country_id: data.issuing_country.id ?? null,
    identification_type_id: data.document_types.id ?? null,
    issuing_authority: data.issuing_authority,
    issue_date: data.issue_date,
    expiration_date: data.expiration_date,
    number: data.number
  });
}

export async function updatePassport(data: any, passport_id: number) {
  return await MainAxiosInstance.put(`/employee_passport/${passport_id}`, {
    country_id: data.issuing_country?.id ?? null,
    issue_date: data.issue_date,
    expiration_date: data.expiration_date,
    number: data.numberm,
    identification_type_id: data.document_types.id ?? null,
    issuing_authority: data.issuing_authority,
  });
}


export async function getEmployeePassport(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_passport/${employee_id}`,)
}

export async function getEmployeePassportList(page_limit: number = 55, page: number = 1, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_passport?employee_id=${employee_id}&page_limit=${page_limit}&page=${page}`,)
}


export async function deleteEmployeePassport(passport_id: any) {
  return await MainAxiosInstance.delete(`/employee_passport/${passport_id}`,)
}

// Shirt size

export async function getShirtSizeList(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/shirt_size?&page_limit=${page_limit}&page=${page}`,)
}

export async function getGeneralShirtSizeList(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/shirt_size?page_limit=${page_limit}&page=${page}`,)
}


// Additional Info
export async function createAdditionalInfo(data: any, employee_id: number) {
  return await MainAxiosInstance.post(`/employee_additional_info/${employee_id}`, {
    shirt_size_id: data.shirt_size?.id ?? null,
    allergies: data.allergies,
    dietary_restrictions: data.dietary_restrictions,
    comment: data.comment,
  });
}


export async function getAdditionalInfo(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_additional_info/${employee_id}`,)
}


// Drivers License
export async function createDriversLicense(data: any, employee_id: number) {

  return await MainAxiosInstance.post(`/employee_driver_licence`, {
    employee_id: employee_id,
    number: data.number,
    region: data.region,
    state_id: data.state?.id ?? null,
    expiration_date: data.expiration_date,
    employee_driver_classifications_attributes: [{ classification_id: data.classification?.id ?? null }]
  });
}

export async function updateDriversLicense(data: any, license_id: number) {
  return await MainAxiosInstance.put(`/employee_driver_licence/${license_id}`, {
    number: data.number,
    region: data.region,
    state_id: data.state?.id ?? null,
    expiration_date: data.expiration_date,
    employee_driver_classifications_attributes: [{ classification_id: data.classification?.id ?? null }]
  });
}


export async function getClassificationList(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/driver_classification?page_limit=${page_limit}&page=${page}`,)
}

export async function createClassification(name: string) {
  return await MainAxiosInstance.post(`/driver_classification`, {
    name: name
  });
}

export async function getDriverLicence(page_limit: number = 25, page: number = 1, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_driver_licence/?page_limit=${page_limit}&page=${page}&employee_id=${employee_id}`,)
}

export async function deleteEmployeeLicense(education_id: any) {
  return await MainAxiosInstance.delete(`/employee_driver_licence/${education_id}`,)
}



// Degree 

export async function getEducationDegree(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/education_degree/?page_limit=${page_limit}&page=${page}`,)
}

export async function createEducationDegree(name: string) {
  return await MainAxiosInstance.post(`/education_degree`, {
    name: name
  });
}




//identification_document_type
export async function getIdentificationDocumentTypes(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/identification_document_type/?page_limit=${page_limit}&page=${page}`,)
}

export async function createIdentificationDocumentType(name: string) {
  return await MainAxiosInstance.post(`/identification_document_type`, {
    name: name
  });
}





// Education
export async function createEducation(data: any, employee_id: number) {
  return await MainAxiosInstance.post(`/employee_education`, {
    employee_id: employee_id,
    education_degree_id: data.education_degree?.id ?? null,
    institution: data.institution,
    specialization: data.specialization,
    gpa: data.gpa,
    start_date: data.start_date,
    end_date: data.end_date
  });
}

export async function updateEducation(data: any, id: number) {
  return await MainAxiosInstance.put(`/employee_education/${id}`, {
    education_degree_id: data.education_degree?.id ?? null,
    institution: data.institution,
    specialization: data.specialization,
    gpa: data.gpa,
    start_date: data.start_date,
    end_date: data.end_date
  });
}

export async function getEmployeeEducation(page_limit: number = 25, page: number = 1, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_education/?page_limit=${page_limit}&page=${page}&employee_id=${employee_id}`,)
}

export async function deleteEmployeeEducation(education_id: any) {
  return await MainAxiosInstance.delete(`/employee_education/${education_id}`,)
}


// Job Information
export async function getJobEmployeeDetail(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_job_detail/${employee_id}`)
}

export async function getJobEmployeeDetailList(page_limit: number = 25, page: number = 1, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_job_detail/?page_limit=${page_limit}&page=${page}&employee_id=${employee_id}`)
}


export async function updateJobEmployeeDetail(data: any, employee_id: number) {
  return await MainAxiosInstance.put(`/employee_employment/${employee_id}`, {
    hire_date: data.hire_date,
    probation_end_date: data.probation_end_date,
    contract_end_date: data.contract_end_date,
    time_off_recipient_id: data.time_off_recipient?.id ?? null
  })
}

export async function getJobEmployementDetail(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_employment/${employee_id}`)
}


// Nationality
export async function getNationalities(page_limit: number = 25, page: number = 1, allRecords: boolean = false) {
  return await MainAxiosInstance.get(`/nationality?page=${page}&page_limit=${page_limit}&all_records=${allRecords}`,)
}

export async function createNationality(name: string) {
  return await MainAxiosInstance.post(`/nationality`, {
    name: name
  });
}



// Compensation
export async function getJobEmployeeCompensation(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_compensation/${employee_id}`)
}

export async function getJobEmployeeActiveCompensation(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_compensation/active?employee_id=${employee_id}`)
}

export async function getJobEmployeeCompensationList(page_limit: number = 25, page: number = 1, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_compensation?page_limit=${page_limit}&page=${page}&employee_id=${employee_id}`)
}


export async function createEmployeeCompensation(data: any, employee_id: number) {
  return await MainAxiosInstance.post(`/employee_compensation/`, {
    additional_payment_type_ids: data.additional_payment_types,
    employee_id: employee_id,
    effective_date: data.effective_date,
    pay_amount: data.pay_amount?.inputValue,
    currency_id: data.pay_amount?.selectValue?.id ?? null,
    payment_period_id: data.payment_period?.id ?? null,
    payment_schedule_id: data.payment_schedule?.id ?? null,
    payment_type_id: data.payment_type?.id ?? null,
    compensation_change_reason_id: data.compensation_change_reason?.id ?? null,
    comment: data.comment
  })
}


export async function updateEmployeeCompensation(data: any, employee_id: number) {
  return await MainAxiosInstance.put(`/employee_compensation/${employee_id}`, {
    additional_payment_type_ids: data.additional_payment_types,
    effective_date: data.effective_date,
    pay_amount: data.pay_amount?.inputValue,
    currency_id: data.pay_amount?.selectValue?.id ?? null,
    payment_period_id: data.payment_period?.id ?? null,
    payment_schedule_id: data.payment_schedule?.id ?? null,
    payment_type_id: data.payment_type?.id ?? null,
    compensation_change_reason_id: data.compensation_change_reason?.id ?? null,
    comment: data.comment
  })
}


export async function deleteEmployeeCompensation(id: number) {
  return await MainAxiosInstance.delete(`/employee_compensation/${id}`)
}


export async function getCompensationChangeReason(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/compensation_change?page_limit=${page_limit}&page=${page}`)
}

export async function createCompensationChangeReason(name: string) {
  return await MainAxiosInstance.post(`/compensation_change`, {
    name: name
  });
}

// Job Info
export async function createJobInfo(data: any, employee_id: number) {  
  return await MainAxiosInstance.post(`/employee_job_detail/`, {
    employee_id: employee_id,
    effective_date: data.effective_date,
    employment_status_id: data.employment_status?.id ?? null,
    location_id: data.location?.id ?? null,
    division_id: data.division?.id ?? null,
    department_id: data.department?.id ?? null,
    job_title_id: data.job_title?.id ?? null,
    manager_id: data.manager?.id ?? null,
    job_change_reason_id: data.job_change_reason?.id ?? null,
    job_termination_reason_id: data.job_termination_reason?.id ?? null,
    job_termination_type_id: data.job_termination_type?.id ?? null,
    rehire_eligibility: data.rehire_eligibility,
    comment: data.comment,
    work_type: data.work_type ?? null,
  })
}

export async function updateJobInfo(data: any, id: number) {

  return await MainAxiosInstance.put(`/employee_job_detail/${id}`, {
    effective_date: data.effective_date,
    employment_status_id: data.employment_status?.id ?? null,
    location_id: data.location?.id ?? null,
    division_id: data.division?.id ?? null,
    department_id: data.department?.id ?? null,
    job_title_id: data.job_title?.id ?? null,
    manager_id: data.manager?.id ?? null,
    job_change_reason_id: data.job_change_reason?.id ?? null,
    job_termination_reason_id: data.job_termination_reason?.id ?? null,
    job_termination_type_id: data.job_termination_type?.id ?? null,
    rehire_eligibility: data.rehire_eligibility,
    comment: data.comment,
    work_type: data.work_type ?? null,
  })
}



export async function deleteJobInfo(id: number) {
  return await MainAxiosInstance.delete(`/employee_job_detail/${id}`)
}


// Job Change Reason 
export async function getJobChangeReason(page_limit: number = 25, page: number = 1) {
  return await MainAxiosInstance.get(`/job_change_reason?page_limit=${page_limit}&page=${page}`)
}


// Employment Status 
export async function getEmploymentStatus(page_limit: number = 25, page: number = 1, allRecords: boolean = false, exceptStatus = null) {
  return await MainAxiosInstance.get(`/employment_status?page_limit=${page_limit}&page=${page}&all_records=${allRecords}${exceptStatus ? `&except=${exceptStatus}` : ''}`)
}



// Documents
export async function uploadDocument(file: any, employee_id: number) {

  const token: any = localStorage.getItem("token");

  return await axios({
    method: "post",
    url: `${process.env.REACT_APP_BASE_API_URL}/employee_file?employee_id=${employee_id}`,
    data: file,
    timeout: 30000,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${JSON.parse(token)}`,
    },
  })
}

export async function deleteDocument(id: number) {
  return await MainAxiosInstance.delete(`/employee_file/${id}`)
}

export async function getDocumentList(page_limit: number = 25, page: number = 1, employee_id: number, ascOrder: string) {
  return await MainAxiosInstance.get(`/employee_file?page_limit=${page_limit}&page=${page}&employee_id=${employee_id}&sort_direction=${ascOrder}`)
}

export async function getDocument(id: number) {
  return await MainAxiosInstance.get(`/employee_file/${id}`, { responseType: 'arraybuffer', timeout: 30000 })
}


export async function downloadDocumentW4(employee_id: number) {
  return await MainAxiosInstance.get(`/employee/pdf/w4?employee_id=${employee_id}`)
}


// termination reason 
export async function getJobTerminationReason(page_limit: number = 25, page: number = 1,) {
  return await MainAxiosInstance.get(`/job_termination_reason?page_limit=${page_limit}&page=${page}`)
}

// Job Termination Type
export async function getJobTerminationType(page_limit: number = 25, page: number = 1,) {
  return await MainAxiosInstance.get(`/job_termination_type?page_limit=${page_limit}&page=${page}`)
}


// Emergency contact

export async function createEmergencyContact(data: any, employee_id: number) {
  return await MainAxiosInstance.post(`/employee_emergency_contact`, {
    employee_id: employee_id,
    name: data.name,
    contact_relationship_id: data.contact_relationship?.id ?? null,
    primary: data.primary,
    work_phone: data.work_phone,
    work_phone_ext: data.work_phone_ext,
    mobile_phone: data.mobile_phone,
    home_phone: data.home_phone,
    email: data.email,
    country_id: data.country?.id ?? null,
    address: data.address,
    address_details: data.address_details,
    city: data.city,
    region: data.region,
    state_id: data.state?.id ?? null,
    postal_code: data.postal_code
  })
}

export async function updateEmergencyContact(data: any, employee_id: number) {
  return await MainAxiosInstance.put(`/employee_emergency_contact/${employee_id}`, {
    name: data.name,
    contact_relationship_id: data.contact_relationship?.id ?? null,
    primary: data.primary,
    work_phone: data.work_phone,
    work_phone_ext: data.work_phone_ext,
    mobile_phone: data.mobile_phone,
    home_phone: data.home_phone,
    email: data.email,
    country_id: data.country?.id ?? null,
    address: data.address,
    address_details: data.address_details,
    city: data.city,
    region: data.region,
    state_id: data.state?.id ?? null,
    postal_code: data.postal_code
  })
}

export async function getEmergencyContactList(page_limit: number = 25, page: number = 1, employee_id: number) {
  return await MainAxiosInstance.get(`/employee_emergency_contact?page_limit=${page_limit}&page=${page}&employee_id=${employee_id}`)
}

export async function deleteEmergencyContact(id: any) {
  return await MainAxiosInstance.delete(`/employee_emergency_contact/${id}`)
}

// Contact Relationship
export async function getRelationshipList(page_limit: number = 25, page: number = 1,) {
  return await MainAxiosInstance.get(`/contact_relationship?page_limit=${page_limit}&page=${page}`)
}

export async function createRelationship(name: string) {
  return await MainAxiosInstance.post(`/contact_relationship`, {
    name: name
  });
}

// Emplyoee count
export async function getEmployeeCount() {
  return await MainAxiosInstance.get(`/employee_info/employee_count`)
}



// Employee PDF
export async function getEmployeeW4(id: number) {
  const token: any = localStorage.getItem("token");
  return await axios.request({
    url: `${process.env.REACT_APP_BASE_API_URL}/employee/pdf/w4?employee_id=${id}`,
    method: 'get',
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${JSON.parse(token)}`
    }
  })
}

export async function getEmployeeI9(id: number) {
  const token: any = localStorage.getItem("token");
  return await axios.request({
    url: `${process.env.REACT_APP_BASE_API_URL}/employee/pdf/i9?employee_id=${id}`,
    method: 'get',
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${JSON.parse(token)}`
    }
  })
}

export async function getUserList(page_limit: number = 50, page: number = 1) {
  return await MainAxiosInstance.get(`/umg/employee_user?page_limit=${page_limit}&page=${page}`)
}

// User Roles

export async function getUserRoleList(page_limit: number = 25, page: number = 1, employee_id: number, onlyAccess = false, t: TFunction) {
  return await MainAxiosInstance.get(`/role?page_limit=${page_limit}&page=${page}&employee_id=${employee_id}&only_access=${onlyAccess}`)
    .then((response: any) => {
      return {
        ...response,
        data: {
          list: sortBy(response.data.list.map((role: Role) => {
            return { 
              ...role,
              name: role.id_name 
                ? t(`enums.roles.${role.id_name}`)
                : role.name === 'No Access'
                  ? t(`enums.roles.no_access`)
                  : ''
              }
          }), ['name'])
        }
      }
    })
}

export async function getUserRoleInfo(employee_id: number) {
  return await MainAxiosInstance.get(`/umg/employee_user/user_role?employee_id=${employee_id}`)
}

export async function changeUserRole(data: any, employee_id: number, roleChange: boolean) {
  return await MainAxiosInstance.post(`/umg/employee_user/user_role`, {
    employee_id: employee_id,
    role_id: data.role?.id,
    user_email: data.user_email,
    role_change: (roleChange ? roleChange : false)
  })
}

export async function deactivateUser(employee_id: number) {
  return await MainAxiosInstance.post(`/umg/employee_user/deactivate?employee_id=${employee_id}`)
}

export async function changeOwner(data: any) {
  return await MainAxiosInstance.post(`/umg/employee_user/change_owner`, {
    employee_id: data.employee?.id,
    role_id: data.role?.id
  })
}

// Company
export async function getCompanies() {
  return await MainAxiosInstance.get(`/company/list`)
}

export async function getOwner() {
  return await MainAxiosInstance.get(`/company/owner`)
}

export async function getPotentialOwners() {
  return await MainAxiosInstance.get(`/company/potential_owners`)
}

export async function createCompany(data: any) {
  const token: any = localStorage.getItem('token')

  return axios({
    method: "post",
    params: {
      company_name: data.company_name,
    },
    url: `${process.env.REACT_APP_AUTH_API_URL}/company/create`,
    headers: { Authorization: `Bearer ${JSON.parse(token)}` }
  });
}

export async function switchCompany(company_id: number) {
  const token: any = localStorage.getItem('token')

  return axios({
    method: "post",
    params: { company_id: company_id },
    url: `${process.env.REACT_APP_AUTH_API_URL}/company/switch`,
    headers: { Authorization: `Bearer ${JSON.parse(token)}` }
  });
}

export async function rsgeAuthenthification(data: any) {
  return await MainAxiosInstance.post(`/revenue_service/authentication`, {
    username: data.username,
    password: data.password
  })
}

export async function rsgePinAuthenthification(data: any) {
  return await MainAxiosInstance.post(`/revenue_service/authentication/sms_authentication`, {
    pin: data.pin
  })
}


export async function reSedAuthCode(data: any) {
  return await MainAxiosInstance.post(`/revenue_service/authentication`, {
    username: data.username,
    password: data.password
  })
}

export async function sendDataToRsge(employeeId: any) {
  return await MainAxiosInstance.post(`/revenue_service/employee`, {
    employee_id: employeeId
  });
}

export async function checkEmployeeData(employeeId: any) {
  return await MainAxiosInstance.post(`/revenue_service/employee/check`, {
    employee_id: employeeId
  });
}


export async function saveTimeOffUnauthorizedData(token: string, status: string) {
  return await MainAxiosInstance.put(`/unauthorized/time_off/statuses`, {
    token: token,
    status: status
  });
}

export async function getJobAddetionalInfo(personId: any) {
  return await MainAxiosInstance.get(`/job_additional_information/${personId}`)
}

export async function createJobAddetionalInfo(userId: number, data: any, addetionalInfo: any) {
  if (!isEmpty(addetionalInfo) && addetionalInfo?.id) {
    return await MainAxiosInstance.put(`/job_additional_information/${userId}`, {
      pension_status: data.pension_status,
      bank_account: data.bank_account
    });
  }
  else {
    return await MainAxiosInstance.post(`/job_additional_information/${userId}`, {
      pension_status: data.pension_status,
      bank_account: data.bank_account
    });
  }
}

export async function getTimeOfftypeOptions(endPoint: any, typeId: any) {
  return await MainAxiosInstance.get(`${endPoint}/${typeId}`)
}

export async function getLocation(id: number) {
  return await MainAxiosInstance.get(`/location/${id}`);
}

export async function getBenefit(id: number) {
  return await MainAxiosInstance.get(`/benefit/${id}`);
}

export async function getBenefits() {
  return await MainAxiosInstance.get('/benefit');
}

export async function getAdjustmentBalance(adjustmentType: any, adjustmentDays: any, effectiveDate: any, employeeInfo: any, types: any) {
  return await MainAxiosInstance.get(`/time_off/time_off_balance_adjustments/balance`, {
    params: {
      id: adjustmentType,
      employee_id: employeeInfo?.id,
      effective_date: effectiveDate,
      time_off_type_id: types?.type?.id
    }
  })
}

export async function getEmployeeDependents(employee_id: number) {
  return await MainAxiosInstance.get(`/employee_dependent/all?employee_id=${employee_id}`);
}

export async function getBenefitCompletionReasons() {
  return await MainAxiosInstance.get(`/benefit_completion_reason`);
}

export async function updateTimesheetTimes(params: TimesheetTimesInput) {
  return await MainAxiosInstance.post(`/timesheet/times`, undefined, { params });
}

export async function getDeduction(id: number) {
  return await MainAxiosInstance.get<Deduction>(`/deduction/${id}`);
}

export async function getAdditionalEarning(id: number) {
  return await MainAxiosInstance.get<AdditionalEarning>(`/additional_earning/${id}`);
}

export async function updatePaymentDocumentAdditional(params: PaymentDocumentAdditionalMutationInput) {
  return await MainAxiosInstance.post<PaymentDocumentMutationPayload>(
    '/payment_earning_additional',
    params,
  );
}

export async function updatePaymentDocumentPayType(params: PaymentDocumentPayTypeMutationInput) {
  return await MainAxiosInstance.put<PaymentDocumentMutationPayload>(
    `/payment_earning_pay_type/${params.id}`,
    {
      amount: params.amount
    },
  );
}

export async function updatePaymentDocumentDeduction(params: PaymentDocumentDeductionMutationInput) {
  return await MainAxiosInstance.post<PaymentDocumentDeductionsMutationPayload>(
    '/payment_employment_deduction',
    params,
  );
}

export async function updateAdvanceDeduction(params: AdvanceDeductionMutationInput) {
  return await MainAxiosInstance.post<AdvanceDeductionMutationPayload>(
    '/advance_payment_deduction',
    params,
  );
}

export async function getActiveEmployees(params: ActiveEmployeeInput) {
  return await MainAxiosInstance.get('/active_employee', { params });
}

export async function getDocumentActiveEmployees(id: string | number) {
  return await MainAxiosInstance.get(`/advance_payment_document/${id}/active_employees`);
}

export async function updateAdvancePayment(params: AdvancePaymentAmountMutationInput) {
  return await MainAxiosInstance.put<AdvancePaymentPayload>(`/advance_payment/${params.id}`, {
    amount: params.amount
  });
}
  
export async function getCompanyPermissionSettings() {
  return await MainAxiosInstance.get<CompanyPermissionSettings>('/company_permission_setting');
}
