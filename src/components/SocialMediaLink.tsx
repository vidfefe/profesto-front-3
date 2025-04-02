import styled from "styled-components";
import { ReactComponent as FacebookIcon } from 'assets/svg/social_nets/facebook.svg';
import { ReactComponent as TwitterIcon } from 'assets/svg/social_nets/twitter.svg';
import { ReactComponent as LinkedinIcon } from 'assets/svg/social_nets/linkedin.svg';

interface SocMediaLinkProps {
    name: string,
    href: string
};

const SocialMediaLink = ({ name, href }: SocMediaLinkProps) => {
    const renderSocialLink = (name: string) => {
        if (name === 'facebook') {
            return <StyledFacebookIcon />;
        } else if (name === 'linkedin') {
            return <StyledLinkedinIcon />
        } else if (name === 'twitter') {
            return <StyledTwitterIcon />
        }
    };

    return (
        <div>
            <a href={href} rel="noreferrer" target='_blank'>
                {renderSocialLink(name)}
            </a>
        </div>
    )
};

export default SocialMediaLink;

const StyledFacebookIcon = styled(FacebookIcon)`
    &:hover {
        g {
            fill: #4867aa;
        }
        path { 
            fill: #FFF;
        }
    }
`;

const StyledLinkedinIcon = styled(LinkedinIcon)`
    &:hover {
        g {
            fill: #2867b2;
        }
        path { 
            fill: #FFF;
        }
    }
`;

const StyledTwitterIcon = styled(TwitterIcon)`
    &:hover {
        g {
            fill: #5da9dd;
        }
        path { 
            fill: #FFF;
        }
    }
`;
