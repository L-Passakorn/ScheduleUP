export interface OIDCConfig {
    onSigninCallback: (user: any) => void;
    onSignoutCallback: (user: any) => void;
    authority: string;
    client_id: string;
    scope: string;
    response_type: string;
    silent_renew: boolean;
    use_refresh_token: boolean;
    redirect_uri: string;
}

const oidcConfig: OIDCConfig = {
    onSignoutCallback: (user) => {
        window.location.href = '/';
    },
    onSigninCallback: (user) => {
        window.location.href = '/';
    },
    authority: 'http://psusso-test.psu.ac.th/application/o/psuapi-contest-chanom',
    client_id: 'xUnSLmLZwZ0bWPVyUvfWsnJHbSIjKUGId6efo2RR',
    scope: 'openid email profile offline_access',
    response_type: 'code',
    silent_renew: true,
    use_refresh_token: true,
    redirect_uri: 'http://localhost:3000/',
};

export default oidcConfig;