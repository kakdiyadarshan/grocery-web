import { combineReducers } from "redux";
import alertSlice from "./slice/alert.slice";
import authSlice from "./slice/auth.slice";
import categorySlice from "./slice/category.slice";
import productSlice from "./slice/product.slice";
import privacySlice from "./slice/privacy.slice";
import contactSlice from "./slice/contact.slice";
import cartSlice from "./slice/cart.slice";
import wishlistSlice from "./slice/wishlist.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    category: categorySlice,
    product: productSlice,
    privacy: privacySlice,
    contact: contactSlice,
    cart: cartSlice,
    wishlist: wishlistSlice,
});

