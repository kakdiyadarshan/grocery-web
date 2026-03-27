import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Printer, Download, ArrowLeft, CheckCircle } from "lucide-react";
import jsPDF from "jspdf";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById } from "../redux/slice/order.slice";

const InvoicePage = () => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Invoice Not Found</h2>
        <Link to="/" className="text-[var(--primary)] font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Go Back to Home
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
  const totalAmount = currentOrder.totalAmount || (subtotal + tax + shipping);

  const downloadInvoicePDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const green = [34, 139, 34];
    const darkGray = [30, 30, 30];
    const lightGray = [245, 245, 245];
    const midGray = [120, 120, 120];

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

    const tableY = infoY + 26;
    doc.setFillColor(...green);
    doc.rect(14, tableY, pageW - 28, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("ITEM", 18, tableY + 7);
    doc.text("QTY", 140, tableY + 7, { align: "center" });
    doc.text("TOTAL", pageW - 18, tableY + 7, { align: "right" });

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

    const tableBottom = tableY + 10 + orderItems.length * 14;
    const totY = tableBottom + 10;
    const totX = pageW - 14;
    const labelX = totX - 60;
    const totals = [
      { label: "Subtotal", value: `Rs. ${subtotal.toFixed(2)}` },
      { label: "Shipping", value: shipping === 0 ? "FREE" : `Rs. ${shipping.toFixed(2)}` },
      { label: "Tax (8%)", value: `Rs. ${tax.toFixed(2)}` },
    ];
    totals.forEach((t, i) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...midGray);
      doc.text(t.label, labelX, totY + i * 8, { align: "left" });
      doc.text(t.value, totX, totY + i * 8, { align: "right" });
    });

    const totalRowY = totY + totals.length * 8 + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...darkGray);
    doc.text("TOTAL AMOUNT", labelX, totalRowY + 2, { align: "left" });
    doc.setTextColor(34, 120, 34);
    doc.text(`Rs. ${totalAmount.toFixed(2)}`, totX, totalRowY + 2, { align: "right" });


    doc.save(`Invoice_${currentOrder._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to={`/order-completed?order_id=${currentOrder._id}`} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-gray-900 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Order
        </Link>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-5 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={downloadInvoicePDF} className="flex items-center gap-2 bg-[var(--primary)] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-md">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div id="invoice-content" className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
        <div className="bg-[var(--primary)] px-10 py-8 flex flex-col sm:flex-row justify-between items-start gap-6 text-white">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">FreshMart Grocery</h1>
            <p className="text-green-100 text-sm mt-1">123 Market Street, Ahmedabad, Gujarat 380001</p>
            <p className="text-green-100 text-sm mt-0.5">support@freshmart.com | +91 98765 43210</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-black text-3xl tracking-wider">INVOICE</p>
            <p className="text-green-100 text-sm mt-1">Order: <span className="font-bold text-white">#{currentOrder._id.toString().slice(-8).toUpperCase()}</span></p>
            <p className="text-green-100 text-sm">Date: <span className="font-bold text-white">{new Date(currentOrder.createdAt).toLocaleDateString()}</span></p>
          </div>
        </div>

        <div className="px-10 py-4 bg-[var(--primary-light)]/40 border-b border-gray-100 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <span className="text-sm font-bold text-[var(--primary)]">Order {currentOrder.status.toUpperCase()}</span>
          <span className="ml-auto text-xs text-gray-500 font-medium">Payment Mode: <span className="font-bold text-gray-800">{currentOrder.paymentMethod || "COD"}</span></span>
        </div>

        <div className="px-10 py-8">
          <div className="mb-10">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Bill To</h3>
            <p className="font-extrabold text-gray-900 text-base">{currentOrder.userId?.name || "Customer"}</p>
            <p className="text-gray-500 text-sm">{currentOrder.userId?.email}</p>
          </div>

          <table className="w-full mb-8 text-sm text-left">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-4 py-3 rounded-tl-xl font-bold text-xs uppercase">Item</th>
                <th className="px-4 py-3 text-center font-bold text-xs uppercase">Qty</th>
                <th className="px-4 py-3 text-center font-bold text-xs uppercase">Unit Price</th>
                <th className="px-4 py-3 text-right rounded-tr-xl font-bold text-xs uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, i) => {
                const product = item.productId || {};
                const price = product.discountPrice || product.price || 0;
                return (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-4 font-bold text-gray-900">
                      {product.name}
                      {item.selectedVariant && (
                        <div className="text-[10px] text-[var(--primary)] font-bold uppercase mt-0.5">
                          {item.selectedVariant.weight} {item.selectedVariant.unit}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-900 font-bold">{item.quantity}</td>
                    <td className="px-4 py-4 text-center text-gray-600 font-semibold">Rs. {(item.selectedVariant?.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-right font-extrabold text-gray-900">Rs. {((item.selectedVariant?.price || 0) * item.quantity).toFixed(2)}</td>



                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Shipping</span>
                <span className="text-[var(--primary)] font-bold">{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Estimated Tax (8%)</span>
                <span className="text-gray-900 font-bold">₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-gray-200 mt-2 pt-4 flex justify-between items-center text-lg font-black">
                <span className="text-gray-800">Total</span>
                <span className="text-[var(--primary)]">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
