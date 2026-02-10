import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isAccountDisabled: false,
    disabledMessage: '',
  },
  reducers: {
    setAccountDisabled: (state, action) => {
      state.isAccountDisabled = true;
      state.disabledMessage =
        action.payload ||
        'Your account has been disabled by the admin. Please contact support.';
    },
    clearAccountDisabled: state => {
      state.isAccountDisabled = false;
      state.disabledMessage = '';
    },
  },
});

export const { setAccountDisabled, clearAccountDisabled } = uiSlice.actions;
export default uiSlice.reducer;
