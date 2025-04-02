import { Route, Switch } from 'react-router';
import Dictionary from './Dictionary';
import { useTranslation } from "react-i18next";
import { region } from 'lib/Regionalize';
import { Benefits } from './Benefits';
import { Deductions } from './Deductions';
import { AdditionalEarnings } from './AdditionalEarnings';

export const Dictionaries = () => {
    const { t } = useTranslation();
    return (
        <Switch>
            <Route path="/settings/benefit_information/benefit" component={() => <Benefits withChecking endpoint="/benefit" singularTitle={t('settings.menu.singularTitle.benefit')}  title={t('settings.menu.benefits')}/>} />
            <Route path="/settings/benefit_information/benefit_type" component={() => <Dictionary endpoint="/benefit_type" singularTitle={t('settings.menu.singularTitle.benefit_type')}  title={t('settings.menu.benefit_types')}/>} />
            <Route path="/settings/benefit_information/benefit_completion_reason" component={() => <Dictionary endpoint="/benefit_completion_reason" singularTitle={t('settings.menu.singularTitle.benefit_completion_reason')}  title={t('settings.menu.benefit_completion_reasons')}/>} />

            <Route path="/settings/job_information/compensation_change" component={() => <Dictionary endpoint="/compensation_change" singularTitle={t('settings.menu.singularTitle.compensation_change_reason')} title={t('settings.menu.compensation_change_reasons')} />} />
            <Route path="/settings/job_information/job_change_reason" component={() => <Dictionary endpoint="/job_change_reason" singularTitle={t('settings.menu.singularTitle.job_change_reason')}  title={t('settings.menu.job_change_reasons')}/>} />
            <Route path="/settings/job_information/job_termination_reason" component={() => <Dictionary endpoint="/job_termination_reason" singularTitle={t('settings.menu.singularTitle.termination_reason')}  title={t('settings.menu.termination_reasons')} />} />

            <Route path="/settings/job_information/job_termination_type" component={() => <Dictionary endpoint="/job_termination_type" singularTitle={t('settings.menu.singularTitle.termination_type')}  title={t('settings.menu.termination_types')} />} />

            <Route path="/settings/job_information/department" component={() => <Dictionary withChecking endpoint="/department" singularTitle={t('settings.menu.singularTitle.department')}  title={t('settings.menu.departments')}  />} />
            <Route path="/settings/job_information/divisions" component={() => <Dictionary withChecking endpoint="/division" singularTitle={t('settings.menu.singularTitle.division')} title={t('settings.menu.divisions')} />} />
            <Route path="/settings/job_information/employment_status" component={() => <Dictionary withChecking endpoint="/employment_status" singularTitle={t('settings.menu.singularTitle.employment_status')}  title={t('settings.menu.employment_statuses')} queryParams={{ except: 'terminated' }} />} />
            <Route path="/settings/job_information/job_title" component={() => <Dictionary withChecking endpoint="/job_title" singularTitle={t('settings.menu.singularTitle.job_title')}  title={t('settings.menu.job_titles')} />} />

            <Route path="/settings/job_information/location" component={() => <Dictionary withChecking endpoint="/location" singularTitle={t('settings.menu.singularTitle.location')}  title={t('settings.menu.locations')} />} />
            {/* // hidden based on {@link https://app.clickup.com/t/86c2numxj}
            <Route path="/settings/job_information/payment_period" component={() => <Dictionary withChecking endpoint="/payment_period" singularTitle={t('settings.menu.singularTitle.pay_rate_period')}  title={t('settings.menu.pay_rate_periods')} />} /> */}
            <Route path="/settings/job_information/payment_schedule" component={() => <Dictionary withChecking endpoint="/payment_schedule" singularTitle={t('settings.menu.singularTitle.pay_schedule')}  title={t('settings.menu.pay_schedules')} />} />
            <Route path="/settings/job_information/payment_type" component={() => <Dictionary addOrRemove={false} endpoint="/payment_type" singularTitle={t('settings.menu.singularTitle.pay_type')}  title={t('settings.menu.pay_types')} />} />
            <Route path="/settings/job_information/additional_earning" component={() => <AdditionalEarnings endpoint="/additional_earning" singularTitle={t('settings.additionalEarning.name')}  title={t('settings.menu.additional_earnings')} />} />
            <Route path="/settings/job_information/deduction" component={() => <Deductions endpoint="/deduction" singularTitle={t('settings.deduction.name')}  title={t('settings.menu.deductions')} />} />

            <Route path="/settings/personal_information/driver_classification" component={() => <Dictionary endpoint="/driver_classification" singularTitle={t('settings.menu.singularTitle.driver_license_classification')}  title={t('settings.menu.driver_license_classifications')} />} />
            <Route path="/settings/personal_information/education_degree" component={() => <Dictionary endpoint="/education_degree" singularTitle={t('settings.menu.singularTitle.education_degree')} title={t('settings.menu.education_degrees')} />} />
            <Route path="/settings/personal_information/identification_document_type" component={() => <Dictionary endpoint="/identification_document_type" singularTitle={t('settings.menu.singularTitle.identification_document_type')} title={t('settings.menu.identification_document_types')} />} />
            <Route path="/settings/personal_information/contact_relationship" component={() => <Dictionary endpoint="/contact_relationship" singularTitle={t('settings.menu.singularTitle.emergency_contact_relationship')} title={t('settings.menu.emergency_contact_relationships')}/>} />
            <Route path="/settings/personal_information/language" component={() => <Dictionary endpoint="/language" singularTitle={t('settings.menu.singularTitle.language')} title={t('settings.menu.languages')}  />} />
            <Route path="/settings/personal_information/nationality" component={() => <Dictionary endpoint="/nationality" singularTitle={t('settings.menu.singularTitle.nationalitie')}  title={t('settings.menu.nationalities')} />} />
            <Route path="/settings/personal_information/shirt_size" component={() => <Dictionary endpoint="/shirt_size" singularTitle={t('settings.menu.singularTitle.shirt_size')} title={t('settings.menu.shirt_sizes')} />} />
            {region(['eng']) && <Route path="/settings/personal_information/visa" component={() => <Dictionary endpoint="/visa" singularTitle={t('settings.menu.singularTitle.visa')}  title={t('settings.menu.visas')} />} />}

            <Route 
                path="/settings/timeoff_types" 
                component={() => <Dictionary endpoint="/time_off_type" singularTitle={t('settings.menu.singularTitle.time_off_type')} title={t('settings.menu.time_off_type')} />} 
                />
        </Switch>
    )
};