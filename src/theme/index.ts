import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type { } from '@mui/lab/themeAugmentation';

export const colors: Record<string, any> = {
    colors: {
        primary: {
            green: '#339966',
            white: '#FFFFFF',
            black: '#00101A',
            red: '#F46A6A',
            gray: '#9C9C9C',
            blue: '#172B37',
        },
        secondary: {
            darkenWhite: '#F8F8F7',
            lightGray: '#EEEEEE',
            lightRed: '#FDEDEE',
            darkenRed: '#C54343',
            lightGreen: '#EAF5EB',
            darkenGreen: '#1F6B45',
            successGreen: '#77B448',
            lightOrange: '#FCF2E4',
            warningOrange: '#F4906A',
            bluePurple: '#6666FF',
            lightBluePurple: '#9999FF',
        }
    }
}

export const theme = responsiveFontSizes(createTheme({
    palette: {
        mode: 'light',
        primary: {
            // light: will be calculated from palette.primary.main,
            main: '#339966',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contrast with palette.primary.main
        },
        secondary: {
            light: '#0066ff',
            main: '#0044ff',
            // dark: will be calculated from palette.secondary.main,
            contrastText: '#ffcc00',
        },
        // Used by `getContrastText()` to maximize the contrast between
        // the background and the text.
        contrastThreshold: 3,
        // Used by the functions below to shift a color's luminance by approximately
        // two indexes within its tonal palette.
        // E.g., shift from Red 500 to Red 300 or Red 700.
        tonalOffset: 0.2,
    },
    typography: {
        fontFamily: ['Aspira Regular', 'FiraGO Regular', 'Helvetica', 'sans-serif'].join(','),
    },
    zIndex: {
        modal: 999,
    },
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
        MuiButton: {
            defaultProps: {
                disableRipple: true,
                disableElevation: true,
                disableFocusRipple: true,
                disableTouchRipple: true,
            },
            variants: [
                {
                    props: { variant: 'contained' },
                    style: {
                        backgroundColor: '#339966',
                        color: '#fff',
                        fontWeight: 'inherit',
                        fontFamily: 'inherit',
                        textTransform: 'inherit',
                        '&:focus': { backgroundColor: '#1F6B45' },
                    },
                },
                {
                    props: { variant: 'text' },
                    style: {
                        fontFamily: 'inherit',
                        fontWeight: 'inherit',
                        textTransform: 'inherit',
                        '&:focus, &:hover': { backgroundColor: '#DCEEE5', color: '#339966' }
                    }
                }
            ],
        },
        MuiLoadingButton: {
            styleOverrides: {
                loadingIndicator: {
                    color: '#FFF',
                },
                root: {
                    '&.MuiLoadingButton-loading': {
                        backgroundColor: '#339966',
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    transition: 'none !important',
                    boxShadow: '0px 3px 6px #00000029',
                    border: '1px solid #D6D6D6',
                },
            }
        },
        MuiList: {
            styleOverrides: {
                root: {
                    padding: '0 0',
                }
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: '#00101A',
                    height: 40,
                    "&:hover, &.Mui-focused, &:focus": {
                        color: "#339966",
                        backgroundColor: "#DCEEE5"
                    }
                }
            }
        },
        MuiSelect: {
            variants: [
                {
                    props: { size: 'medium' },
                    style: {
                        height: '50px',
                        backgroundColor: '#FFF'
                    },
                },
                {
                    props: { size: 'small' },
                    style: {
                        height: '40px',
                        backgroundColor: '#FFF'
                    }
                }
            ],
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: 10,
                    fontWeight: 'inherit',
                    backgroundColor: '#6C787F',
                    color: '#FFF',
                    padding: '8px 10px',
                },
                arrow: {
                    color: '#6C787F',
                }
            },
            defaultProps: {
                arrow: true,
                placement: 'bottom-start'
            }
        },
        MuiTextField: {
            variants: [
                {
                    props: { size: 'medium' },
                    style: {
                        '& .MuiInputBase-root': {
                            height: 50
                        }
                    },
                },
                {
                    props: { size: 'small' },
                    style: {
                        '& .MuiInputBase-root': {
                            height: 40
                        }
                    }
                }
            ],
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#D6D6D6'
                        },
                        '&:hover fieldset': {
                            borderColor: '#99CC33'
                        },
                        '&.Mui-focused fieldset': {
                            border: '1px solid #99CC33'
                        }
                    }
                }
            }
        },
        MuiInputBase: {
            variants: [
                {
                    props: { size: 'medium' },
                    style: {
                        height: 50
                    },
                },
                {
                    props: { size: 'small' },
                    style: {
                        height: 40
                    }
                }
            ],
        },
        MuiDialog: {
            defaultProps: {
                onClick: (e) => e.stopPropagation(),
                BackdropProps: {
                    sx: {
                        pointerEvents: 'none',
                    },
                },
            },
            styleOverrides: {
                paper: {
                    border: 0,
                },
                container: {
                    backgroundColor: 'rgba(0,0,0, 0.7)'
                }
            }
        },
        MuiModal: {
            defaultProps: {
                onClick: (e) => e.stopPropagation(),
                BackdropProps: {
                    sx: {
                        pointerEvents: 'none',
                    },
                },
            },
        }
    }
}));