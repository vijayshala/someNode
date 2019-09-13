import cookie from 'react-cookie';

const AUTH_TOKEN = '_AUTH_TOKEN';
class CurrentViewerClass {
  get authToken() {
    let auth = cookie.load(AUTH_TOKEN); //, { domain: window.location.hostname}
    // console.log(AUTH_TOKEN, 'auth....', cookie.load('_csrf'), 'options:', { domain: window.location.hostname })
    return auth ? {
      token: auth,
      type: 'jwt'
    } : null;
  }

  get csrfToken() {
    let csrf = cookie.load('_csrf'); //, { domain: window.location.hostname}    
    // console.log(AUTH_TOKEN, 'csrf....', csrf)
    return csrf;
  }

  removeAuthToken() {
    cookie.remove(AUTH_TOKEN);
  }  
}

export const CurrentViewer = new CurrentViewerClass();


