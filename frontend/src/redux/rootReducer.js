import { combineReducers } from "redux";
import alertSlice from "./slice/alert.slice";
import authSlice from "./slice/auth.slice";
import privacySlice from "./slice/privacy.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    privacy: privacySlice,
});

