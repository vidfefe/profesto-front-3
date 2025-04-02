import styled from 'styled-components';

interface TextProps {
    type: 'title' | 'subtitle' | 'large' | 'medium' | 'bold'
}

const Text = styled.span<TextProps>((props) => {
    let style = {};

    switch (props.type) {
        case 'title': {
            style = {
                fontSize: 15,
                fontFamily: "'Aspira Wide Demi', 'FiraGO Medium'",
                fontWeight: 500
            }
            break;
        }
        case 'subtitle': {
            style = {
                fontSize: 12,
                fontFamily: "'Aspira Wide Demi', 'FiraGO Medium'",
                fontWeight: 900
            }
            break;
        }
        case 'large': {
            style = {
                fontSize: 13,
                fontFamily: "'Aspira Regular', 'FiraGo Regular'",
                fontWeight: 400
            }
            break;
        }
        case 'medium': {
            style = {
                fontSize: 12,
                fontFamily: "'Aspira Regular', 'FiraGo Regular'",
                fontWeight: 400
            }
            break;
        }
        case 'bold': {
            style = {
                fontSize: 12,
                fontFamily: "'Aspira Regular', 'FiraGo Regular'",
                fontWeight: 500
            }
            break
        }
        default: {
            break;
        }
    }

    return {
        fontFamily: 'Aspira Regular',
        color: '#414141',
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
    }

});

export default Text;
