import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, ArrowRight, Download } from "lucide-react";
import jsPDF from "jspdf";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../redux/slice/order.slice";
import { getCart, clearCart, removeCoupon } from "../redux/slice/cart.slice";
import { BASE_URL } from "../utils/baseUrl";
import logo from "../Image/logo.png";

const OrderCompleted = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");
  const sessionId = queryParams.get("session_id");

  const { currentOrder, loading } = useSelector((state) => state.order);


  useEffect(() => {
    const verifyAndLoadOrder = async () => {
      let currentId = orderId;

      if (sessionId && !orderId) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${BASE_URL}/verifyStripeSession`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId })
          });
          const result = await response.json();
          if (result.success && result.data?._id) {
            currentId = result.data._id;
          }
        } catch (error) {
          console.error("Stripe session verification failed:", error);
        }
      }

      if (currentId) {
        dispatch(getOrderById(currentId));
        // Force refresh frontend and clear server-side cart
        dispatch(clearCart());
        dispatch(getCart());
        dispatch(removeCoupon());
        localStorage.removeItem('appliedCoupon');
      } else if (!sessionId) {
        console.warn("OrderCompleted: order_id query parameter missing");
      }
    };

    verifyAndLoadOrder();
  }, [dispatch, orderId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        {!orderId && (
          <p className="text-gray-500 mb-2">
            No order ID provided. Please complete checkout first.
          </p>
        )}
        <Link to="/" className="text-[var(--primary)] font-bold flex items-center gap-2">
          <ArrowRight className="rotate-180" /> Go Back to Home
        </Link>
      </div>
    );
  }

  const orderItems = currentOrder.items || [];
  const addr = currentOrder.address || {};
  const deliveryAddress = addr.address
    ? `${addr.address}, ${addr.city}, ${addr.state} - ${addr.zip}, ${addr.country}`
    : "Address not available";


  const subtotal = orderItems.reduce((acc, item) => {
    const variant = item.selectedVariant;
    const price = variant?.discountPrice || variant?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  
  // Calculate coupon discount
  const couponDiscount = currentOrder.coupon ? (subtotal * currentOrder.coupon.discount) / 100 : 0;
  const total = currentOrder.totalAmount || (subtotal + tax + shipping - couponDiscount);

  const downloadInvoicePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const green = [30, 122, 30]; // #1E7A1E

    // ===== LOAD LOGO =====
    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = src;
      });

    const logoBase64 = await loadImage(logo);

    // ===== LOGO =====
    doc.addImage(logoBase64, "PNG", 20, 15, 35, 15);

    // ===== HEADER =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...green);
    doc.text("INVOICE", pageWidth - 20, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(
      `#${currentOrder._id.slice(-6).toUpperCase()}`,
      pageWidth - 20,
      26,
      { align: "right" }
    );

    // ===== COMPANY INFO =====
    doc.setFontSize(9);
    doc.text("123 Market Street, Ahmedabad", 20, 35);
    doc.text("support@freshmart.com", 20, 40);

    // ===== BILL TO =====
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...green);
    doc.text("Bill To:", 20, 55);

    const addr = currentOrder.address || {};

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`${addr.firstname || ""} ${addr.lastname || ""}`, 20, 61);
    doc.text(addr.email || "-", 20, 66);
    doc.text(addr.phone || "-", 20, 71);

    // ===== DELIVERY =====
    const deliveryAddress = addr.address
      ? `${addr.address}, ${addr.city}, ${addr.state} - ${addr.zip}, ${addr.country}`
      : "Address not available";

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...green);
    doc.text("Delivery:", 120, 55);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(deliveryAddress, 120, 61, { maxWidth: 70 });

    // ===== TABLE HEADER =====
    let y = 85;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...green);

    doc.text("Item", 20, y);
    doc.text("Qty", 110, y);
    doc.text("Unit Price", 135, y);
    doc.text("Savings", 160, y);
    doc.text("Total", 190, y, { align: "right" });

    doc.setTextColor(0, 0, 0);

    y += 5;
    doc.line(20, y, 190, y);

    // ===== ITEMS =====
    const orderItems = currentOrder.items || [];

    doc.setFont("helvetica", "normal");

    orderItems.forEach((item) => {
      const product = item.productId || {};
      const variant = item.selectedVariant;

      const originalPrice = variant?.price || 0;
      const discountPrice = variant?.discountPrice || originalPrice;
      const savings = originalPrice - discountPrice;

      y += 12;

      // Product Name
      doc.setFont("helvetica", "bold");
      doc.text(product.name || "Product", 20, y);

      // Variant
      if (variant) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`${variant.weight} ${variant.unit}`, 20, y + 5);
        doc.setFontSize(10);
      }

      // Qty
      doc.text(String(item.quantity), 110, y);

      // Unit Price
      doc.text(`$${originalPrice.toFixed(2)}`, 135, y);

      // Savings (green)
      if (savings > 0) {
        doc.setTextColor(...green);
        doc.text(`- $${savings.toFixed(2)}`, 160, y);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text("-", 160, y);
      }

      // Total
      doc.setFont("helvetica", "bold");
      doc.text(
        `$${(discountPrice * item.quantity).toFixed(2)}`,
        190,
        y,
        { align: "right" }
      );

      doc.setFont("helvetica", "normal");
    });

    // ===== CALCULATIONS =====
    const subtotal = orderItems.reduce((acc, item) => {
      const variant = item.selectedVariant;
      const price = variant?.discountPrice || variant?.price || 0;
      return acc + price * item.quantity;
    }, 0);

    const tax = subtotal * 0.08;
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const couponDiscount = currentOrder.coupon ? (subtotal * currentOrder.coupon.discount) / 100 : 0;
    const total = currentOrder.totalAmount || subtotal + tax + shipping - couponDiscount;

    // ===== TOTAL SECTION =====
    y += 15;
    doc.line(120, y, 190, y);

    y += 10;

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 120, y);
    doc.text(`$${subtotal.toFixed(2)}`, 190, y, { align: "right" });

    y += 8;
    doc.text("Shipping:", 120, y);
    doc.text(
      shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`,
      190,
      y,
      { align: "right" }
    );

    y += 8;
    doc.text("Tax:", 120, y);
    doc.text(`$${tax.toFixed(2)}`, 190, y, { align: "right" });

    // Coupon Discount
    if (couponDiscount > 0) {
      y += 6;
      doc.setTextColor(...green);
      doc.text(`Coupon (${currentOrder.coupon.code}):`, 120, y);
      doc.text(`-$${couponDiscount.toFixed(2)}`, 190, y, { align: "right" });
      doc.setTextColor(0, 0, 0);
    }

    // ===== TOTAL (GREEN TEXT ONLY) =====
    y += 12;

    // Top border line only - light and subtle
    doc.setDrawColor(220, 220, 220); // lighter grey border
    doc.setLineWidth(0.3);
    doc.line(120, y - 8, 190, y - 8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...green);
    doc.text("TOTAL AMOUNT", 120, y);

    doc.text(`$${total.toFixed(2)}`, 190, y, { align: "right" });

    // reset text color back to black for footer
    doc.setTextColor(0, 0, 0);

    // ===== FOOTER =====
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Thank you for your purchase!", pageWidth / 2, 280, {
      align: "center",
    });

    doc.save(`Invoice_${currentOrder._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">

        {/* Order Confirmed Header */}
        <div className="p-6 sm:p-10 text-center border-b border-gray-100 bg-gradient-to-b from-[var(--primary-light)]/40 to-white">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 flex items-center justify-center rounded-full bg-[var(--primary)] shadow-[0_0_20px_rgba(34,139,34,0.15)] ring-4 ring-[var(--primary)] relative z-10">
            <Check className="text-white w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 text-sm sm:text-[15px] mt-2 sm:mt-3 max-w-sm mx-auto px-4">
            Your order{" "}
            <span className="font-bold text-[var(--primary)] shadow-sm border border-gray-100 px-2 py-0.5 rounded ml-1 tracking-wide">
              #{currentOrder?._id?.toString().slice(-6).toUpperCase() || "N/A"}
            </span>{" "}
            has been placed successfully.
          </p>
        </div>

        {/* Order Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-8 text-sm border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Date</p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm">
              {new Date(currentOrder.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Order ID</p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
              #{currentOrder?._id?.toString().slice(-6).toUpperCase() || "N/A"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Payment</p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm">{currentOrder.paymentMethod || "COD"}</p>
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Status</p>
            <p className="font-bold text-[var(--primary)] text-xs sm:text-[15px] capitalize">
              {currentOrder.status}
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">
            Delivery Address
          </p>
          <p className="font-bold text-gray-900 text-sm leading-snug">{deliveryAddress}</p>
          <div className="mt-2 space-y-0.5">
            {addr.phone && (
              <p className="text-gray-500 text-xs">Phone: {addr.phone}</p>
            )}
            {addr.firstname && (
              <p className="text-gray-500 text-xs">
                Name: {addr.firstname} {addr.lastname}
              </p>
            )}
            {addr.email && (
              <p className="text-gray-500 text-xs">Email: {addr.email}</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-5 sm:p-8 border-b border-gray-100">
          <h3 className="text-base sm:text-[17px] font-bold mb-4 sm:mb-6 text-gray-900 flex items-center justify-between">
            Order Summary
            <span className="text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
              {orderItems.length} items
            </span>
          </h3>
          <div className="space-y-3">
            {orderItems.map((item, i) => {
              const product = item.productId || {};
              const variant = item.selectedVariant;
              const originalPrice = variant?.price || 0;
              const price = variant?.discountPrice || originalPrice;
              const hasOffer = price < originalPrice;

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 sm:gap-4 text-sm bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg p-1.5 border border-gray-100 shrink-0 shadow-sm flex items-center justify-center">
                    <img
                      src={
                        product.images?.[0]?.url ||
                        product.images?.[0] ||
                        product.image ||
                        "https://via.placeholder.com/50"
                      }
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-gray-900 font-bold text-sm sm:text-base line-clamp-1">
                        {product.name}
                      </span>
                      <span className="font-bold text-gray-900 text-sm sm:text-[15px] whitespace-nowrap">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      {variant && (
                        <span className="text-[10px] sm:text-xs font-bold text-[var(--primary)] uppercase tracking-tight">
                          {variant.weight} {variant.unit}
                        </span>
                      )}
                      <span className="text-gray-500 text-[10px] sm:text-xs font-medium">
                        Qty: {item.quantity}
                      </span>
                    </div>

                    {hasOffer && (
                      <div className="mt-0.5">
                        <span className="text-[10px] sm:text-[11px] text-gray-400 line-through">
                          (${originalPrice.toFixed(2)} each)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50/80 p-5 sm:p-8 border-b border-gray-100 text-sm sm:text-[15px] space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Subtotal</span>
            <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Shipping</span>
            <span className="text-gray-900 font-bold">
              {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Estimated Tax</span>
            <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-green-600 font-medium">
              <span>Coupon Discount ({currentOrder.coupon?.code})</span>
              <span className="text-green-600 font-bold">-${couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex flex-col xs:flex-row justify-between xs:items-end pt-4 sm:pt-5 mt-2 border-t border-gray-200/60 gap-1 sm:gap-2">
            <span className="text-gray-400 font-bold text-xs sm:text-sm uppercase tracking-widest">
              Total Amount
            </span>
            <span className="text-[24px] sm:text-[28px] md:text-[32px] font-black text-[var(--primary)] leading-none tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 sm:p-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={downloadInvoicePDF}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-xl py-3.5 text-sm sm:text-[15px] font-bold text-[var(--primary)] hover:border-[var(--primary)] hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-xl py-3.5 text-sm sm:text-[15px] font-bold hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--primary)]/10"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderCompleted;