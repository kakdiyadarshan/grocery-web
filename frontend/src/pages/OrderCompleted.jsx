import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Download } from "lucide-react";
import jsPDF from "jspdf";

const invoice = {
  orderId: "#SDGT1254FD",
  date: "29 July 2024",
  transaction: "TR542SSFE",
  payment: "PayPal",
  delivery: "02 Aug 2024",
  storeName: "FreshMart Grocery",
  storeAddress: "123 Market Street, Ahmedabad, Gujarat 380001",
  storeEmail: "support@freshmart.com",
  storePhone: "+91 98765 43210",
  customerName: "Shweta Beladiya",
  customerAddress: "456 Residency Road, Surat, Gujarat 395001",
  customerEmail: "shweta@email.com",
  items: [
    { name: "Fresh Oranges", weight: "500 g", qty: 1, price: 47.0 },
    { name: "Red Onion",     weight: "500 g", qty: 1, price: 16.0 },
    { name: "Yellow Lemon",  weight: "1 Kg",  qty: 1, price: 8.0  },
    { name: "Pomegranate",   weight: "500 g", qty: 1, price: 14.4 },
  ],
  subtotal: 85.40,
  shipping: 0.0,
  discount: 11.0,
  total: 74.4,
};

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
  doc.text(invoice.storeName, 14, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 255, 220);
  doc.text(invoice.storeAddress, 14, 23);
  doc.text(`${invoice.storeEmail}  |  ${invoice.storePhone}`, 14, 29);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", pageW - 14, 16, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Order ID: ${invoice.orderId}`, pageW - 14, 23, { align: "right" });
  doc.text(`Date: ${invoice.date}`, pageW - 14, 29, { align: "right" });

  const infoY = 46;
  const boxW = (pageW - 28 - 9) / 4;
  const infoItems = [
    { label: "ORDER DATE",    value: invoice.date },
    { label: "TRANSACTION",   value: invoice.transaction },
    { label: "PAYMENT MODE",  value: invoice.payment },
    { label: "DELIVERY DATE", value: invoice.delivery },
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
  doc.text("WEIGHT", 110, tableY + 7, { align: "center" });
  doc.text("QTY", 140, tableY + 7, { align: "center" });
  doc.text("PRICE", pageW - 18, tableY + 7, { align: "right" });

  invoice.items.forEach((item, i) => {
    const rowY = tableY + 10 + i * 12;
    if (i % 2 === 0) {
      doc.setFillColor(250, 255, 250);
      doc.rect(14, rowY, pageW - 28, 12, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    doc.text(item.name, 18, rowY + 8);
    doc.setTextColor(...midGray);
    doc.text(item.weight, 110, rowY + 8, { align: "center" });
    doc.text(String(item.qty), 140, rowY + 8, { align: "center" });
    doc.setTextColor(...darkGray);
    doc.text(`$${item.price.toFixed(2)}`, pageW - 18, rowY + 8, { align: "right" });
  });

  const tableBottom = tableY + 10 + invoice.items.length * 12;
  doc.setDrawColor(...green);
  doc.setLineWidth(0.5);
  doc.line(14, tableBottom, pageW - 14, tableBottom);

  const totY = tableBottom + 10;
  const totX = pageW - 14;
  const labelX = totX - 60;
  const totals = [
    { label: "Subtotal",         value: `$${invoice.subtotal.toFixed(2)}` },
    { label: "Shipping",         value: invoice.shipping === 0 ? "FREE" : `$${invoice.shipping.toFixed(2)}` },
    { label: "Discount Applied", value: `- $${invoice.discount.toFixed(2)}` },
  ];
  doc.setFontSize(9);
  totals.forEach((t, i) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...midGray);
    doc.text(t.label, labelX, totY + i * 8, { align: "left" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text(t.value, totX, totY + i * 8, { align: "right" });
  });

  const totalRowY = totY + totals.length * 8 + 6;
  doc.setDrawColor(...green);
  doc.setLineWidth(0.6);
  doc.line(labelX - 4, totalRowY - 6, totX + 2, totalRowY - 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...darkGray);
  doc.text("TOTAL AMOUNT", labelX, totalRowY + 2, { align: "left" });
  doc.setTextColor(34, 120, 34);
  doc.text(`$${invoice.total.toFixed(2)}`, totX, totalRowY + 2, { align: "right" });

  const footY = Math.max(totalRowY + 30, 250);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, footY, pageW - 14, footY);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...midGray);
  doc.text("Thank you for shopping with us!", pageW / 2, footY + 7, { align: "center" });
  doc.setFontSize(8);
  doc.text("For any queries, contact us at support@freshmart.com", pageW / 2, footY + 13, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(
    `Invoice generated on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageW / 2, footY + 19, { align: "center" }
  );

  doc.save(`Invoice_${invoice.orderId.replace("#", "")}.pdf`);
};



const OrderCompleted = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">

        {/* Header */}
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
              #SDGT1254FD
            </span>{" "}
            has been placed successfully.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 text-sm border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Date</p>
            <p className="font-bold text-gray-900">29 July 2024</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Transaction</p>
            <p className="font-bold text-gray-900">TR542SSFE</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Payment</p>
            <p className="font-bold text-gray-900">PayPal</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Delivery</p>
            <p className="font-bold text-[var(--primary)] text-[15px]">02 Aug 2024</p>
          </div>
        </div>

        {/* Products */}
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-[17px] font-bold mb-6 text-gray-900 flex items-center justify-between">
            Order Summary
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">4 items</span>
          </h3>

          <div className="space-y-3">
            {[
              { name: "Fresh Oranges", weight: "500 g", price: "$47.00", img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=100&h=100&fit=crop" },
              { name: "Red Onion",     weight: "500 g", price: "$16.00", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100&h=100&fit=crop" },
              { name: "Yellow Lemon",  weight: "1 Kg",  price: "$8.00",  img: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=100&h=100&fit=crop" },
              { name: "Pomegranate",   weight: "500 g", price: "$14.40", img: "https://m.media-amazon.com/images/I/61GsBpMM-IL._AC_UF1000,1000_QL80_.jpg" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white rounded-lg p-1.5 border border-gray-100 shrink-0 shadow-sm">
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold block">{item.name}</span>
                    <span className="text-gray-500 text-xs font-medium mt-0.5">Qty: 1 • {item.weight}</span>
                  </div>
                </div>
                <span className="font-bold text-gray-900 text-[15px] pr-2">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-50/80 p-8 border-b border-gray-100 text-[15px] space-y-4">
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Subtotal</span>
            <span className="text-gray-900 font-bold">$85.40</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Shipping</span>
            <span className="text-gray-900 font-bold">$0.00</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 font-medium">
            <span>Discount Applied</span>
            <span className="text-[var(--primary)] font-bold bg-[var(--primary-light)]/50 px-2 py-0.5 rounded -mr-2">- $11.00</span>
          </div>
          <div className="flex justify-between items-end pt-5 mt-2 border-t border-gray-200/60">
            <span className="text-gray-900 font-bold text-lg uppercase tracking-wide">Total Amount</span>
            <span className="md:text-[28px] text-[24px] font-black text-[var(--primary)] leading-none tracking-tight">$74.40</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadInvoicePDF}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-lg py-3 text-[15px] font-bold text-[var(--primary)] hover:border-[var(--primary)] hover:bg-gray-50 transition-colors group"
          >
            <Download className="w-4 h-4 text-[var(--primary)]" />
            Download Invoice
          </button>

          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-lg py-3 text-[15px] font-bold hover:bg-[var(--primary-hover)] transition-all shadow-[0_4px_12px_rgba(34,139,34,0.25)] hover:shadow-[0_6px_16px_rgba(34,139,34,0.3)] hover:-translate-y-0.5"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4 text-white/90" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCompleted;