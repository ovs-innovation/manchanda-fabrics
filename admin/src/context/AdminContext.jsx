import Cookies from 'js-cookie';
import React, { createContext, useReducer } from 'react';
import { resolveCloudinaryUrl } from '@/utils/cloudinaryUrl';

export const AdminContext = createContext();

const sanitizeAdminInfo = (info) => {
  if (!info) return null;
  if (info.image && !resolveCloudinaryUrl(info.image)) {
    const next = { ...info, image: '' };
    Cookies.set('adminInfo', JSON.stringify(next));
    return next;
  }
  return info;
};

const getInitialAdminInfo = () => {
  const cookieValue = Cookies.get('adminInfo');
  if (!cookieValue) return null;
  try {
    return sanitizeAdminInfo(JSON.parse(cookieValue));
  } catch (e) {
    Cookies.remove('adminInfo');
    return null;
  }
};

const initialState = {
  adminInfo: getInitialAdminInfo(),
};

function reducer(state, action) {
  switch (action.type) {
    case 'USER_LOGIN':
      return { ...state, adminInfo: action.payload };

    case 'USER_LOGOUT':
      return {
        ...state,
        adminInfo: null,
      };

    default:
      return state;
  }
}

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
