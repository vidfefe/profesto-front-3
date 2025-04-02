import React, { useEffect, useState, useRef } from "react";
import UniversalInput from "components/Input/UniversalInput";
import Checkbox from "components/Checkbox";
import styled from "styled-components";
import { Controller } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
const PersonalNumber = ({
    control,
    errors,
    register,
    wacthRemoveMask,
    watchPersonalNumber,
    hiddeTitile,
    onClear,
    showRemoveMark = true,
    labelStyle,
    placeholder,
}: any) => {
    const { t } = useTranslation();
    const inputRef = useRef<any>(null);


    useEffect(() => {
        if (!isEmpty(inputRef?.current) && !isEmpty(errors?.personal_number)) {
            inputRef?.current?.focus();
        }
    }, [errors?.personal_number?.message])

    return (
        <Conatiner>
            <div className="input-item">
                {!hiddeTitile && <label style={labelStyle}>{t('employee.personal_number')}<sup>*</sup></label>}
                <div>
                    {!wacthRemoveMask ? <>
                        <Controller
                            name="personal_number"
                            control={control}
                            rules={{
                                required: true,
                                validate: value => value.length !== 11 ? false : true
                            }}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <StyledPresnoalNumberInput
                                        type='tel'
                                        getInputRef={inputRef}
                                        format="###########"
                                        mask={"_"}
                                        valueIsNumericString
                                        value={value}
                                        onValueChange={(e) => onChange(e.value)}
                                        className={`form_control ${errors.personal_number ? 'error-input' : ''}`}
                                        style={{height: 40}}
                                        placeholder={placeholder}
                                        $inputError={!!errors.personal_number}
                                    />
                                </>
                            )}
                        />
                        {
                            errors?.personal_number && 
                            <span style={{ color: 'var(--red)', marginTop: 6, fontSize: 10, display: 'inline-block'}}>
                                {
                                    errors.personal_number.message ? errors.personal_number.message : !watchPersonalNumber ? t('validations.personal_number_required') : t('validations.personal_number_char')
                                }
                            </span>
                        }

                    </>
                        :
                        <UniversalInput
                            {...register}
                            errorText={errors.personal_number ? errors.personal_number.message : '' as any}
                        />
                    }
                </div>
                {showRemoveMark &&
                    <div style={{ marginTop: 5 }}>
                        <Controller
                            name="remove_mask"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Checkbox
                                    checked={value}
                                    onChange={(event) => {
                                        onChange(event.target.checked);
                                        onClear(event.target.checked)
                                    }}
                                    label={t('globaly.remove_mask')}
                                />
                            )}
                        />
                    </div>
                }
            </div>
        </Conatiner>
    )
}
const Conatiner = styled.div`

`
const StyledPresnoalNumberInput = styled(PatternFormat) <{ $inputError?: boolean }>`
    width: 100%;
    border-radius: 4px;
    border: ${({ $inputError }) => $inputError ? '1px solid var(--red)' : '1px solid #D6D6D6'};
    padding: 11px 13px;

    &:focus {
      border-color:  ${({ $inputError }) => $inputError ? 'var(--red)' : '#99CC33'};
    }
    &::placeholder {
      color: #9C9C9C;
    }
`;
export default PersonalNumber;