import { combineReducers } from "redux";
import alertSlice from "./slice/alert.slice";
import authSlice from "./slice/auth.slice";
import categorySlice from "./slice/category.slice";
import productSlice from "./slice/product.slice";
import privacySlice from "./slice/privacy.slice";
import contactSlice from "./slice/contact.slice";
import blogCategorySlice from "./slice/blogCategory.slice"
import blogSlice from "./slice/blog.slice";
import subscribeSlice from "./slice/subscribe.slice";
import termsSlice from "./slice/terms.slice";
import offerSlice from "./slice/offer.slice";
import faqSlice from "./slice/faq.slice";
import cartSlice from "./slice/cart.slice";
import wishlistSlice from "./slice/wishlist.slice";
import addressSlice from "./slice/address.slice";
import offerbannerSlice from "./slice/offerbanner.slice";
import bannerSlice from "./slice/banner.slice";
import orderSlice from "./slice/order.slice";
import reviewSlice from "./slice/review.slice";
import shippingSlice from "./slice/shipping.slice";

export const rootReducer = combineReducers({
    alert: alertSlice,
    auth: authSlice,
    category: categorySlice,
    product: productSlice,
    privacy: privacySlice,
    contact: contactSlice,
    blogCategory: blogCategorySlice,
    blog: blogSlice,
    subscribe: subscribeSlice,
    terms: termsSlice,
    offer: offerSlice,
    faq: faqSlice,
    cart: cartSlice,
    wishlist: wishlistSlice,
    address: addressSlice,
    banner: bannerSlice,
    offerbanner: offerbannerSlice,
    order: orderSlice,
    review: reviewSlice,
    shipping: shippingSlice,
});
