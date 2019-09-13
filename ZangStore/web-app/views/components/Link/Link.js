import React from 'react'
import { Link as RLink } from 'react-router-dom'

// import config from '../../common/utils/config'

const linkRouter = {

};

export const resolveLink = function (url) {
  return url;
  return (config.isSpacesInstallation()) ? url.replace('/spaces', '/admin') : url;
}

export const setRouter = function(router) {
  linkRouter.router=router;
}

export const linkGo = function (url, replace=false) {
  if(replace) {
    linkRouter.router.replace(resolveLink(url))
  }
  else {
    linkRouter.router.push(resolveLink(url))
  }
}

import './Link.css'
export const Link = ({ type='', to='', className, onClick, children, target, isExternal=false}) => {
  var url = resolveLink(to);
  if (isExternal) {
    // console.warn('Link isExternal:' + isExternal + ' url:'+ url);
    return <a href={url} target={target} className={className} onClick={onClick}>{children}</a>
  }
  
  return (
    <RLink type={type} to={url} target={target} className={className} onClick={onClick}>
      {children}
    </RLink>
  );
}

export default Link
