import React, { Fragment, useState, MouseEvent, useEffect } from "react";
import { useTranslation } from 'react-i18next'
import styled from "styled-components";
import Menu from '@mui/material/Menu';
import { ReactComponent as ArrowDownIcon } from "assets/svg/lang/arrow-d.svg";
import { ReactComponent as KaFlag } from "assets/svg/lang/ka.svg";
import { ReactComponent as EnFlag } from "assets/svg/lang/en.svg";
import { find, isEmpty, map } from "lodash";
import { UpdateLocales } from "services";
import { currentUserSelector } from "redux/selectors";
import { useSelector } from "react-redux";
interface Language {
    name: string;
    name_id: string;
    id_name: string;
    icon: any
}

interface IProps{
    withoutDropDown?: boolean;
    onBoarding?: boolean
}


const ChangeLanguage = ({withoutDropDown, onBoarding}: IProps) => {
    const currentUser = useSelector(currentUserSelector);
    const { t, i18n } = useTranslation();
    const [lang, setLang] = useState<Language[]>([{
        name: 'ქართული',
        name_id: 'ქა',
        id_name: 'ka',
        icon: <KaFlag/>
    },{
        name: 'English',
        name_id: 'EN',
        id_name: 'en',
        icon: <EnFlag/>
    }]);
    const [selected, setSelected] = useState<any>(null);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        setSelected(find(lang, (x: any) => {return i18n.language === x.id_name}));
    }, []);

    const setLanguageServerSide = async (item: Language) => {

        if (!isEmpty(currentUser)) {
            UpdateLocales(item.id_name);
        }
        setSelected(item);
        await localStorage.setItem('lang', item.id_name);
        window.location.reload();
    }

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const renderMenu = () => {
        return (
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 6, vertical: -10 }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                <div style={{paddingTop: 8, paddingBottom: 7, width: 180}}>
                {
                    map(lang, (item: Language, index: number) => {
                        return (
                            <LanguageItems key={index.toString()+'_lang'} onClick={() => setLanguageServerSide(item)}>
                                <FlagIcon>{item.icon}</FlagIcon>
                                <LanguageName>{item.name} ({item.name_id})</LanguageName>
                            </LanguageItems>
                        )
                    })
                }
                </div>
            </Menu>
        )
    }

    const renderItems = () => {
        return (
            !isEmpty(selected) ? 
                <LanguageBlock onClick={handleClick}>
                    <LanguageItem>
                        <FlagIcon>{selected.icon}</FlagIcon>
                        <LanguageName $color={onBoarding ? true : false}>{onBoarding ? selected.name_id : selected.name}</LanguageName>
                    </LanguageItem>
                    {onBoarding ? <OnBiardingStyledArrowDownIcon $active={open}/> : <StyledArrowDownIcon $active={open}/>}
                </LanguageBlock>
            :
            null
        )
    }

    if (withoutDropDown) {
        return (
            <Fragment>
                <WithoutMenuContainer>
                    {
                        map(lang, (item: Language, index: number) => {
                            return (
                                <LanguageItemsForMenu
                                    $currentLang={i18n.language}
                                    $currentItem={item.id_name}
                                    key={index.toString()+'_lang'} 
                                    onClick={() => setLanguageServerSide(item)}
                                >
                                    <FlagIcon>{item.icon}</FlagIcon>
                                    <LanguageName>{item.name_id}</LanguageName>
                                </LanguageItemsForMenu>
                            )
                        })
                    }
                </WithoutMenuContainer>
            </Fragment>
        )
    }
    else {
        if (onBoarding) {
            return (
                <Fragment>
                    <LanguageContainerOnboarding $isActive={open}>
                        {renderItems()}
                    </LanguageContainerOnboarding>
                    {renderMenu()}
                </Fragment>
            )
        }
        else {
            return (
                <Fragment>
                    <LanguageContainer>
                        {renderItems()}
                    </LanguageContainer>
                    {renderMenu()}
                </Fragment>
            )
        }
    }
}
const LanguageItemsForMenu = styled.div <{ $currentLang?: string, $currentItem?: string, }>`
    opacity: ${(props) => { return props.$currentLang === props.$currentItem ? 1 : .5 }};
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 17px;
    cursor: pointer;
    &:hover {
        opacity: 1;
    }
`

const LanguageItems = styled.div `
    background-color: #fff;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
    padding: 4px 5px 0px 5px;
    cursor: pointer;
    &:hover {
        background-color: #DCEEE5;
    }
`
const FlagIcon = styled.div `
    & > svg {
        width: 25px;
        height: 25px;
    }
`
const LanguageContainer = styled.div`
    margin-top: -12px;
    max-width: 150px;
    margin-top: 10px;
`
const LanguageContainerOnboarding = styled.div<{ $isActive?: boolean }>`
    background-color: ${(props) => { return props.$isActive ? '#215549' : '#243844' }};
    height: 40px;
    display: flex;
    border-radius: 30px;
    margin-right: 12px;
    align-items: center;
    justify-content: center;
    margin-top: 0px;
    width: 105px;
    padding: 4px 9px 0px 9px;
    &:hover {
        background-color: #215549;
    }
    &:active {
        background-color: #215549;
    }
`
const LanguageBlock = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    gap: 20px;
`
const LanguageItem = styled.div `
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
`
const LanguageName = styled.div<{ $color?: boolean }> `
    color: ${(props) => { return props.$color ? '#fff' : '#6C6C6C' }};
    margin-top: -5px;
`
const StyledArrowDownIcon = styled(ArrowDownIcon) <{ $active?: boolean }>`
    transform: ${(props) => { return props.$active ? 'rotate(180deg)' : 'rotate(0deg)' }};
    width: 15px;
    height: 15px;
    margin-top: -5px;
`;
const OnBiardingStyledArrowDownIcon = styled(ArrowDownIcon) <{ $active?: boolean }>`
    transform: ${(props) => { return props.$active ? 'rotate(180deg)' : 'rotate(0deg)' }};
    width: 13px;
    height: 13px;
    margin-top: -5px;
    top: 3px;
    path{
      fill: #FFF;
    }
`;
const WithoutMenuContainer = styled.div `
    height: 46px;
    background: #fbfbfb 0% 0% no-repeat padding-box;
    border-radius: 0px 0px 4px 4px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 30px;
    padding: 0px 0px 0px 22px;
`

export default ChangeLanguage;