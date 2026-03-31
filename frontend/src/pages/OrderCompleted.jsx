import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, ArrowRight, Download } from "lucide-react";
import jsPDF from "jspdf";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../redux/slice/order.slice";
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
      if (sessionId) {
        try {
          const token = localStorage.getItem('token');
          await fetch(`${BASE_URL}/verifyStripeSession`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId })
          });
        } catch (error) {
          console.error("Stripe session verification failed:", error);
        }
      }

      if (orderId) {
        dispatch(getOrderById(orderId));
      } else {
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

  const couponId = currentOrder.couponId || {};

  const subtotal = orderItems.reduce((acc, item) => {
    const variant = item.selectedVariant;
    const price = variant?.discountPrice || variant?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = currentOrder.totalAmount || subtotal + tax + shipping;

  const downloadInvoicePDF = async () => {
    // ── Load logo as base64 ──────────────────────────────────────
    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve({
            base64: canvas.toDataURL("image/png"),
            width: img.width,
            height: img.height,
          });
        };
        img.src = src;
      });

    const logoData = await loadImage(logo);
    const logoBase64 = logoData.base64;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Colors ───────────────────────────────────────────────────
    const green = [34, 139, 34];
    const darkGray = [30, 30, 30];
    const lightGray = [247, 248, 249];
    const midGray = [100, 105, 110];
    const white = [255, 255, 255];
    const borderGray = [230, 230, 230];

    // ── HEADER BAND ──────────────────────────────────────────────
    // Logo image - preserve aspect ratio
    const maxLogoW = 38;
    const maxLogoH = 24;
    let logoW = maxLogoW;
    let logoH = (logoData.height / logoData.width) * maxLogoW;
    if (logoH > maxLogoH) {
      logoH = maxLogoH;
      logoW = (logoData.width / logoData.height) * maxLogoH;
    }
    const logoY = 8 + (maxLogoH - logoH) / 2;
    doc.addImage(logoBase64, "PNG", 14, logoY, logoW, logoH);

    // Company info below logo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...midGray);
    doc.text("123 Market Street, Ahmedabad, Gujarat 380001", 14, 38);
    doc.text("support@freshmart.com  |  +91 98765 43210", 14, 43);

    // RIGHT — Invoice label + number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...darkGray);
    doc.text("INVOICE", pageW - 14, 22, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...midGray);
    const invoiceNo = `#${currentOrder._id?.toString().slice(-8).toUpperCase()}`;
    doc.text(invoiceNo, pageW - 14, 29, { align: "right" });

    // ── BILL TO / DELIVER TO BAND ────────────────────────────────
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 52, pageW, 30, "F");

    // vertical divider
    doc.setDrawColor(...borderGray);
    doc.line(pageW / 2, 56, pageW / 2, 78);

    const billName = addr.firstname
      ? `${addr.firstname} ${addr.lastname}`
      : "Customer";

    // BILL TO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...midGray);
    doc.text("BILL TO", 14, 59);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    doc.text(billName, 14, 65);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...midGray);
    if (addr.email) doc.text(addr.email, 14, 70);
    if (addr.phone) doc.text(`Phone: ${addr.phone}`, 14, 75);

    // DELIVER TO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...midGray);
    doc.text("DELIVER TO", pageW / 2 + 8, 59);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    doc.text(billName, pageW / 2 + 8, 65);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...midGray);
    const addrLine = addr.address
      ? `${addr.address}, ${addr.city}, ${addr.state} - ${addr.zip}`
      : "Address not available";
    doc.text(addrLine, pageW / 2 + 8, 70, { maxWidth: 88 });

    // ── META INFO BOXES ──────────────────────────────────────────
    const metaY = 88;
    const metaItems = [
      {
        label: "ORDER DATE",
        value: new Date(currentOrder.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      },
      { label: "STATUS", value: currentOrder.status.toUpperCase() },
      { label: "PAYMENT", value: currentOrder.paymentMethod || "COD" },
      { label: "ITEMS", value: String(orderItems.length) },
    ];
    const boxW = (pageW - 28 - 9) / 4;

    metaItems.forEach((info, i) => {
      const x = 14 + i * (boxW + 3);
      doc.setFillColor(...lightGray);
      doc.roundedRect(x, metaY, boxW, 18, 2, 2, "F");
      doc.setDrawColor(...borderGray);
      doc.roundedRect(x, metaY, boxW, 18, 2, 2, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...midGray);
      doc.text(info.label, x + boxW / 2, metaY + 6, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(info.value, x + boxW / 2, metaY + 14, { align: "center" });
    });

    // ── TABLE ─────────────────────────────────────────────────────
    const tY = metaY + 26;
    const rowH = 16;

    // Column center/anchor positions
    const col = {
      itemLeft: 16,
      qtyCenter: 105,
      priceCenter: 135,
      savCenter: 160,
      totalRight: pageW - 14,
    };

    // Table header
    doc.setFillColor(...green);
    doc.rect(14, tY, pageW - 28, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...white);
    const thY = tY + 5;
    doc.text("ITEM", col.itemLeft, thY, { align: "left", baseline: "middle" });
    doc.text("QTY", col.qtyCenter, thY, { align: "center", baseline: "middle" });
    doc.text("UNIT PRICE", col.priceCenter, thY, { align: "center", baseline: "middle" });
    doc.text("SAVINGS", col.savCenter, thY, { align: "center", baseline: "middle" });
    doc.text("TOTAL", col.totalRight, thY, { align: "right", baseline: "middle" });

    // Table rows
    orderItems.forEach((item, i) => {
      const rY = tY + 10 + i * rowH;
      const product = item.productId || {};
      const variant = item.selectedVariant;
      const origPrice = variant?.price || 0;
      const discPrice = variant?.discountPrice || origPrice;
      const savings = origPrice - discPrice;

      // Alternating stripe
      if (i % 2 !== 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(14, rY, pageW - 28, rowH, "F");
      }

      // Row bottom border
      doc.setDrawColor(...borderGray);
      doc.line(14, rY + rowH, pageW - 14, rY + rowH);

      // Item name + variant
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...darkGray);
      doc.text(product.name || "Product", col.itemLeft, rY + 6);

      if (variant) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...midGray);
        doc.text(`${variant.weight} ${variant.unit}`, col.itemLeft, rY + 11);
      }

      // Qty
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...darkGray);
      doc.text(String(item.quantity), col.qtyCenter, rY + 9, { align: "center" });

      // Unit price
      doc.text(`$${origPrice.toFixed(2)}`, col.priceCenter, rY + 9, { align: "center" });

      // Savings
      if (savings > 0) {
        doc.setTextColor(...green);
      } else {
        doc.setTextColor(...midGray);
      }
      doc.text(
        savings > 0 ? `- $${savings.toFixed(2)}` : "—",
        col.savCenter, rY + 9, { align: "center" }
      );

      // Row total
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkGray);
      doc.text(
        `$${(discPrice * item.quantity).toFixed(2)}`,
        col.totalRight, rY + 9, { align: "right" }
      );
    });

    // ── TOTALS BOX ────────────────────────────────────────────────
    const tableBottom = tY + 10 + orderItems.length * rowH;
    const totBoxX = pageW / 2 + 10;
    const totBoxW = pageW - 14 - totBoxX;
    const totBoxY = tableBottom + 10;
    const totLineH = 9;

    const totalsData = [
      { label: "Subtotal", value: `$${subtotal.toFixed(2)}` },
      { label: "Shipping", value: shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}` },
      { label: "Tax (8%)", value: `$${tax.toFixed(2)}` },
      ...(couponId && couponId.code
        ? [
          {
            label: "Coupon",
            value: `- $${((subtotal * couponId.discount) / 100).toFixed(2)}`
          }
        ]
        : []),
    ];

    const totBoxH = totalsData.length * totLineH + 22;

    doc.setFillColor(...lightGray);
    doc.roundedRect(totBoxX, totBoxY, totBoxW, totBoxH, 3, 3, "F");
    doc.setDrawColor(...borderGray);
    doc.roundedRect(totBoxX, totBoxY, totBoxW, totBoxH, 3, 3, "S");

    totalsData.forEach((t, i) => {
      const ly = totBoxY + 9 + i * totLineH;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...midGray);
      doc.text(t.label, totBoxX + 6, ly);
      doc.text(t.value, totBoxX + totBoxW - 6, ly, { align: "right" });
    });

    // Divider inside totals box
    const divY = totBoxY + totalsData.length * totLineH + 10;
    doc.setDrawColor(...borderGray);
    doc.line(totBoxX + 4, divY, totBoxX + totBoxW - 4, divY);

    // Grand total green band
    doc.setFillColor(...green);
    doc.roundedRect(totBoxX, divY + 3, totBoxW, 13, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...white);
    doc.text("TOTAL AMOUNT", totBoxX + 6, divY + 11);
    doc.text(`$${total.toFixed(2)}`, totBoxX + totBoxW - 6, divY + 11, { align: "right" });

    // ── FOOTER ────────────────────────────────────────────────────
    doc.setFillColor(...green);
    doc.rect(0, pageH - 20, pageW, 20, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...white);
    doc.text(
      "Thank you for shopping with GSORE Organic Food!",
      pageW / 2, pageH - 12, { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(200, 240, 200);
    doc.text(
      "For queries: support@freshmart.com  |  +91 98765 43210",
      pageW / 2, pageH - 6, { align: "center" }
    );

    doc.save(`Invoice_${currentOrder._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">

        {/* Order Confirmed Header */}
        <div className="p-8 pb-10 text-center border-b border-gray-100 bg-gradient-to-b from-[var(--primary-light)]/40 to-white">
          <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-[var(--primary)] shadow-[0_0_20px_rgba(34,139,34,0.15)] ring-4 ring-[var(--primary)] relative z-10">
            <Check className="text-white w-8 h-8 stroke-[3]" />
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 text-[15px] mt-3 max-w-sm mx-auto">
            Your order{" "}
            <span className="font-bold text-[var(--primary)] shadow-sm border border-gray-100 px-2 py-0.5 rounded ml-1 tracking-wide">
              #{currentOrder?._id?.toString().slice(-6).toUpperCase() || "N/A"}
            </span>{" "}
            has been placed successfully.
          </p>
        </div>

        {/* Order Meta Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 text-sm border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Date</p>
            <p className="font-bold text-gray-900">
              {new Date(currentOrder.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Order ID</p>
            <p className="font-bold text-gray-900">
              #{currentOrder?._id?.toString().slice(-6).toUpperCase() || "N/A"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Payment</p>
            <p className="font-bold text-gray-900">{currentOrder.paymentMethod || "COD"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Status</p>
            <p className="font-bold text-[var(--primary)] text-[15px] capitalize">
              {currentOrder.status}
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100">
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
            Delivery Address
          </p>
          <p className="font-bold text-gray-900 text-sm">{deliveryAddress}</p>
          {addr.phone && (
            <p className="text-gray-500 text-xs mt-0.5">Phone: {addr.phone}</p>
          )}
          {addr.firstname && (
            <p className="text-gray-500 text-xs mt-0.5">
              Name: {addr.firstname} {addr.lastname}
            </p>
          )}
          {addr.email && (
            <p className="text-gray-500 text-xs mt-0.5">Email: {addr.email}</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-[17px] font-bold mb-6 text-gray-900 flex items-center justify-between">
            Order Summary
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
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
                  className="flex items-center justify-between text-sm bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-white rounded-lg p-1.5 border border-gray-100 shrink-0 shadow-sm">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          product.images?.[0] ||
                          product.image ||
                          "https://via.placeholder.com/50"
                        }
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-bold block line-clamp-1">
                        {product.name}
                      </span>
                      {variant && (
                        <span className="text-[10px] font-bold text-[var(--primary)] tracking-tight">
                          Weight: {variant.weight} {variant.unit}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-500 text-xs font-medium">
                          Qty: {item.quantity}
                        </span>
                        {hasOffer && (
                          <span className="text-[12px] text-textSecondary line-through">
                            (${originalPrice.toFixed(2)} each)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end pr-2">
                    <span className="font-bold text-gray-900 text-[15px]">
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50/80 p-8 border-b border-gray-100 text-[15px] space-y-4">
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
          {couponId && couponId.code && (
            <div className="flex justify-between text-primary font-medium">
              <span className="flex items-center gap-1">
                Coupon ({couponId.code}) - {couponId.discount}% off
              </span>
              <span className="font-[600]">-${((subtotal * couponId.discount) / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-5 mt-2 border-t border-gray-200/60">
            <span className="text-gray-900 font-bold text-lg uppercase tracking-wide">
              Total Amount
            </span>
            <span className="md:text-[28px] text-[24px] font-black text-[var(--primary)] leading-none tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadInvoicePDF}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-lg py-3 text-[15px] font-bold text-[var(--primary)] hover:border-[var(--primary)] hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-lg py-3 text-[15px] font-bold hover:bg-[var(--primary-hover)] transition-all"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderCompleted;