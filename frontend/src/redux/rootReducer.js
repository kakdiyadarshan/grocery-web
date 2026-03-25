import { combineReducers } from "redux";
import alertSlice from "./slice/alert.slice";
import authSlice from "./slice/auth.slice";
import categorySlice from "./slice/category.slice";
import productSlice from "./slice/product.slice";
import privacySlice from "./slice/privacy.slice";
import termsSlice from "./slice/terms.slice";
import offerSlice from "./slice/offer.slice";
import faqSlice from "./slice/faq.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    category: categorySlice,
    product: productSlice,
    privacy: privacySlice,
    terms: termsSlice,
    offer: offerSlice,
    faq: faqSlice,
});

