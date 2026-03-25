import { combineReducers } from "redux";
import alertSlice from "./slice/alert.slice";
import authSlice from "./slice/auth.slice";
import categorySlice from "./slice/category.slice";
import privacySlice from "./slice/privacy.slice";
import blogCategorySlice from "./slice/blogCategory.slice"
import blogSlice from "./slice/blog.slice";
import subscribeSlice from "./slice/subscribe.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    category: categorySlice,
    privacy: privacySlice,
    blogCategory: blogCategorySlice,
    blog: blogSlice,
    subscribe: subscribeSlice
});

