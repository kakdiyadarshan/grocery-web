import { combineReducers } from "redux";
import alertSlice from "./slice/alert.slice";
import authSlice from "./slice/auth.slice";
import categorySlice from "./slice/category.slice";
import privacySlice from "./slice/privacy.slice";
import contactSlice from "./slice/contact.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    category: categorySlice,
    privacy: privacySlice,
    contact: contactSlice,
});

