import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, ArrowRight, Download } from "lucide-react";
import jsPDF from "jspdf";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../redux/slice/order.slice";

const OrderCompleted = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  const { currentOrder, loading } = useSelector((state) => state.order);

  
  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

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
        <Link to="/" className="text-[var(--primary)] font-bold flex items-center gap-2">
          <ArrowRight className="rotate-180" /> Go Back to Home
        </Link>
      </div>
    );
  }

  const orderItems = currentOrder.items || [];
  const subtotal = orderItems.reduce((acc, item) => {
    const variant = item.selectedVariant;
    const price = variant?.price || 0;
    return acc + (price * item.quantity);
  }, 0);


  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = currentOrder.totalAmount || (subtotal + tax + shipping);


  const downloadInvoicePDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const green = [34, 139, 34];
    const darkGray = [30, 30, 30];
    const lightGray = [245, 245, 245];
    const midGray = [120, 120, 120];

    // Header
    doc.setFillColor(...green);
    doc.rect(0, 0, pageW, 38, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("FreshMart Grocery", 14, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 255, 220);
    doc.text("123 Market Street, Ahmedabad, Gujarat 380001", 14, 23);
    doc.text("support@freshmart.com  |  +91 98765 43210", 14, 29);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageW - 14, 16, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: #${currentOrder._id.toString().slice(-8).toUpperCase()}`, pageW - 14, 23, { align: "right" });
    doc.text(`Date: ${new Date(currentOrder.createdAt).toLocaleDateString()}`, pageW - 14, 29, { align: "right" });

    // Info Grid
    const infoY = 46;
    const boxW = (pageW - 28 - 9) / 4;
    const infoItems = [
      { label: "ORDER DATE", value: new Date(currentOrder.createdAt).toLocaleDateString() },
      { label: "STATUS", value: currentOrder.status.toUpperCase() },
      { label: "PAYMENT MODE", value: currentOrder.paymentMethod || "COD" },
      { label: "TOTAL ITEMS", value: String(orderItems.length) },
    ];
    infoItems.forEach((info, i) => {
      const x = 14 + i * (boxW + 3);
      doc.setFillColor(...lightGray);
      doc.roundedRect(x, infoY, boxW, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...midGray);
      doc.text(info.label, x + boxW / 2, infoY + 6, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(info.value, x + boxW / 2, infoY + 13, { align: "center" });
    });

    // Table Header
    const tableY = infoY + 26;
    doc.setFillColor(...green);
    doc.rect(14, tableY, pageW - 28, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("ITEM", 18, tableY + 7);
    doc.text("QTY", 140, tableY + 7, { align: "center" });
    doc.text("PRICE", pageW - 18, tableY + 7, { align: "right" });

    // Table Rows
    orderItems.forEach((item, i) => {
      const rowY = tableY + 10 + i * 14; 
      const product = item.productId || {};
      const variant = item.selectedVariant;
      const price = variant?.price || 0;

      if (i % 2 === 0) {
        doc.setFillColor(250, 255, 250);
        doc.rect(14, rowY, pageW - 28, 14, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(product.name || "Product", 18, rowY + 6);

      if (variant) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...midGray);
        doc.text(`${variant.weight} ${variant.unit}`, 18, rowY + 10);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(String(item.quantity), 140, rowY + 8, { align: "center" });
      doc.text(`Rs. ${(price * item.quantity).toFixed(2)}`, pageW - 18, rowY + 8, { align: "right" });

    });



    // Totals
    const tableBottom = tableY + 10 + orderItems.length * 14;
    const totY = tableBottom + 10;
    const totX = pageW - 14;
    const labelX = totX - 60;
    const totalsData = [
      { label: "Subtotal", value: `Rs. ${subtotal.toFixed(2)}` },
      { label: "Shipping", value: shipping === 0 ? "FREE" : `Rs. ${shipping.toFixed(2)}` },
      { label: "Tax (8%)", value: `Rs. ${tax.toFixed(2)}` },
    ];

    totalsData.forEach((t, i) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...midGray);
      doc.text(t.label, labelX, totY + i * 8, { align: "left" });
      doc.text(t.value, totX, totY + i * 8, { align: "right" });
    });

    const totalRowY = totY + totalsData.length * 8 + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...darkGray);
    doc.text("TOTAL AMOUNT", labelX, totalRowY + 2, { align: "left" });
    doc.setTextColor(34, 120, 34);
    doc.text(`Rs. ${total.toFixed(2)}`, totX, totalRowY + 2, { align: "right" });


    doc.save(`Invoice_${currentOrder._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
        <div className="p-8 pb-10 text-center border-b border-gray-100 bg-gradient-to-b from-[var(--primary-light)]/40 to-white">
          <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-[var(--primary)] shadow-[0_0_20px_rgba(34,139,34,0.15)] ring-4 ring-[var(--primary)] relative z-10">
            <Check className="text-white w-8 h-8 stroke-[3]" />
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-gray-500 text-[15px] mt-3 max-w-sm mx-auto">
            Your order{" "}
            <span className="font-bold text-[var(--primary)] shadow-sm border border-gray-100 px-2 py-0.5 rounded ml-1 tracking-wide">
              #{currentOrder?._id?.toString().slice(-8).toUpperCase() || "N/A"}
            </span>{" "}

            has been placed successfully.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 text-sm border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Date</p>
            <p className="font-bold text-gray-900">{new Date(currentOrder.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Order ID</p>
            <p className="font-bold text-gray-900">#{currentOrder?._id?.toString().slice(-8).toUpperCase() || "N/A"}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Payment</p>
            <p className="font-bold text-gray-900">{currentOrder.paymentMethod || "COD"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Status</p>
            <p className="font-bold text-[var(--primary)] text-[15px] capitalize">{currentOrder.status}</p>
          </div>
        </div>

        <div className="p-8 border-b border-gray-100">
          <h3 className="text-[17px] font-bold mb-6 text-gray-900 flex items-center justify-between">
            Order Summary
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{orderItems.length} items</span>
          </h3>
          <div className="space-y-3">
            {orderItems.map((item, i) => {
              const product = item.productId || {};
              const price = product.discountPrice || product.price || 0;
              return (
                <div key={i} className="flex items-center justify-between text-sm bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-white rounded-lg p-1.5 border border-gray-100 shrink-0 shadow-sm">
                      <img src={product.images?.[0]?.url || product.images?.[0] || product.image || "https://via.placeholder.com/50"} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-bold block line-clamp-1">{product.name}</span>
                      {item.selectedVariant && (
                        <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-tight">
                          Variant: {item.selectedVariant.weight} {item.selectedVariant.unit}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs font-medium mt-0.5">Qty: {item.quantity}</span>
                    </div>

                  </div>
                  <span className="font-bold text-gray-900 text-[15px] pr-2">₹{((item.selectedVariant?.price || 0) * item.quantity).toFixed(2)}</span>



                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50/80 p-8 border-b border-gray-100 text-[15px] space-y-4">
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Subtotal</span>
            <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Shipping</span>
            <span className="text-gray-900 font-bold">{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Estimated Tax</span>
            <span className="text-gray-900 font-bold">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end pt-5 mt-2 border-t border-gray-200/60">
            <span className="text-gray-900 font-bold text-lg uppercase tracking-wide">Total Amount</span>
            <span className="md:text-[28px] text-[24px] font-black text-[var(--primary)] leading-none tracking-tight">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-8 flex flex-col sm:flex-row gap-4">
          <button onClick={downloadInvoicePDF} className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-lg py-3 text-[15px] font-bold text-[var(--primary)] hover:border-[var(--primary)] hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <Link to="/" className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-lg py-3 text-[15px] font-bold hover:bg-[var(--primary-hover)] transition-all">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderCompleted;