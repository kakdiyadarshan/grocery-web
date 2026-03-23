import { combineReducers } from "redux";
import alertSlice from "./slice/alert.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
});

