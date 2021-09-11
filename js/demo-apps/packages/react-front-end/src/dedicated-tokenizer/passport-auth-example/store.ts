import axios from 'axios';
// easy-peasy is a simple store based on Redux, with a bad name
import { Action, action, Computed, computed, createStore, createTypedHooks, Thunk, thunk } from 'easy-peasy';

import { ApiResponse, UserDocumentsResponse, UserModel, UserResponse } from './types';

// todo: maybe switch from using easy-peasy, this is clunky
interface StoreModel {
  // Properties
  user: UserModel | null;
  loggedIn: Computed<StoreModel, boolean>;
  // Actions
  setUser: Action<StoreModel, UserModel>;
  setSsn: Action<StoreModel, string>;
  // Thunks
  saveSsn: Thunk<StoreModel, string, undefined, StoreModel, Promise<ApiResponse>>;
  loadUser: Thunk<StoreModel>;

  loadDocuments: Thunk<StoreModel, undefined, undefined, StoreModel, Promise<UserDocumentsResponse>>;
  uploadDocumentTokens: Thunk<StoreModel, string[], undefined, StoreModel, Promise<ApiResponse>>;
  login: Thunk<StoreModel, { username: string; password: string }, undefined, StoreModel, Promise<UserResponse>>;
  signup: Thunk<StoreModel, { username: string; password: string }, undefined, StoreModel, Promise<UserResponse>>;
}

export const store = createStore<StoreModel>({
  user: null,
  loggedIn: computed((state) => !!state.user),
  setUser: action((state, user) => {
    state.user = user;
  }),
  setSsn: action((state, ssn) => {
    if (!state.user) {
      throw new Error('Cant set SSN for a user that isnt logged in');
    }
    state.user.ssn_token = ssn;
  }),

  saveSsn: thunk(async (actions, ssn_token, { getState }) => {
    const currentUser = getState().user;
    if (!currentUser) {
      throw new Error('Cant set SSN for a user that isnt logged in');
    }
    console.log('about to make api call');
    const { data } = await axios.post<ApiResponse>(`/user/set-ssn`, { ssn_token });
    console.log('api responded ', data);
    if (data.success) {
      actions.setUser({ ...currentUser, ssn_token });
    }
    return data;
  }),

  loadUser: thunk(async (actions) => {
    const { data } = await axios.get<UserResponse>(`/user/me`);
    if (data.success) {
      actions.setUser(data.user);
      return data;
    }
    return data;
  }),

  loadDocuments: thunk(async () => {
    const { data } = await axios.get<UserDocumentsResponse>(`/documents`);
    return data;
  }),

  uploadDocumentTokens: thunk(async (actions, documents) => {
    console.log('uploading document tokens ', documents);
    const { data } = await axios.post<ApiResponse>(`/documents`, { documents });
    return data;
  }),

  login: thunk(async (actions, { username, password }) => {
    const { data } = await axios.post<UserResponse>(`/auth/login`, { username, password });
    if (data.success) {
      actions.setUser(data.user);
    }
    return data;
  }),

  signup: thunk(async (actions, { username, password }) => {
    const { data } = await axios.post<UserResponse>(`/auth/signup`, { username, password });
    if (data.success) {
      actions.setUser(data.user);
    }
    return data;
  }),
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;