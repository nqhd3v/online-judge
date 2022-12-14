import type { Effect, Model } from 'dva';

import { login, getByToken, resetPassword, register, forgotPassword, validateEmail, reValidateEmail } from '@/services/auth';
import { notification } from 'antd';
import { Reducer } from 'umi';

type TAuthState = {
  authToken?: string;
  current?: any;
};

interface IAuthModel extends Model {
  state: TAuthState;
  effects: {
    login: Effect;
    register: Effect;
    forgotPassword: Effect;
    reSendValidate: Effect;
    validate: Effect;
    getByToken: Effect;
    resetPassword: Effect;
  };
  reducers: {
    saveCurrent: Reducer;
  };
}

const AuthModel: IAuthModel = {
  namespace: 'auth',
  state: {
    authToken: undefined,
    current: undefined,
  },
  effects: {
    *login({ payload }, { call }): Generator<any, any, any> {
      const { username, password, callback, msg } = payload || {};
      const res = yield call(login, {
        username,
        password,
      });
      if (res.isError) {
        notification.error({
          message:
            msg?.({ id: `exception.${res.messageId}`, defaultMessage: '' }, { isMany: false }) ||
            res.msg,
        });
        return;
      }
      const { account, token } = res;
      localStorage.setItem(LC_STR_PREFIX + 'AUTH', token);
      callback?.(account);
    },
    *register({ payload }, { call }): Generator<any, any, any> {
      const { username, password, display_name, email, callback, msg } = payload || {};
      const res = yield call(register, {
        username,
        password,
        display_name,
        email,
      });
      if (res.isError) {
        notification.error({
          message:
            msg?.({ id: `exception.${res.messageId}`, defaultMessage: '' }, { isMany: false }) ||
            res.msg,
        });
        return;
      }
      const { account, token } = res;
      localStorage.setItem(LC_STR_PREFIX + 'AUTH', token);
      callback?.(account);
    },
    *forgotPassword({ payload }, { call }): Generator<any, any, any> {
      const { email, callback, msg } = payload || {};
      const res = yield call(forgotPassword, email);
      if (res.isError) {
        notification.error({
          message:
            msg?.({ id: `exception.${res.messageId}`, defaultMessage: '' }, { isMany: false }) ||
            res.msg,
        });
        return;
      }
      callback?.(res);
    },
    *reSendValidate({ payload }, { call }): Generator<any, any, any> {
      const { callback } = payload || {};
      const res = yield call(reValidateEmail);
      if (res.isError) {
        callback?.(false, res);
        return;
      }
      callback?.(res);
    },
    *getByToken({ payload }, { call, put }): Generator<any, any, any> {
      const { token, callback } = payload || {};
      const authInfo = yield call(getByToken, token);
      if (authInfo.isError) {
        callback?.(authInfo, false);
        return;
      }
      yield put({ type: 'saveCurrent', payload: authInfo });
      callback?.(authInfo);
    },
    *resetPassword({ payload }, { call }): Generator<any, any, any> {
      const { token, password, callback } = payload || {};
      const res = yield call(resetPassword, token, password);
      if (res.isError) {
        callback?.(res, false);
        return;
      }
      callback?.(res);
    },
    *validate({ payload }, { call }): Generator<any, any, any> {
      const { token, callback } = payload || {};
      const res = yield call(validateEmail, token);
      if (res.isError) {
        callback?.(res, false);
        return;
      }
      callback?.(res);
    },
  },
  reducers: {
    saveCurrent(state, { payload }) {
      return {
        ...state,
        current: payload,
      };
    },
  },
};

export default AuthModel;
