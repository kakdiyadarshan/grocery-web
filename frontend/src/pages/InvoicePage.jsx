import React from "react";
import { Link } from "react-router-dom";
import { Printer, Download, ArrowLeft, CheckCircle } from "lucide-react";
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

  const footY = Math.max(totalRowY + 22, 240);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, footY, pageW - 14, footY);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...midGray);
  doc.text(
    "Thank you for shopping with us!",
    pageW / 2, footY + 7, { align: "center" }
  );
  doc.setFontSize(8);
  doc.text(
    "For any queries, contact us at support@freshmart.com",
    pageW / 2, footY + 13, { align: "center" }
  );
  doc.text(
    `Invoice generated on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageW / 2, footY + 19, { align: "center" }
  );

  doc.save(`Invoice_${invoice.orderId.replace("#", "")}.pdf`);
};

const InvoicePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0">

      {/* Action Toolbar – hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/order-completed"
          className="flex items-center gap-2 text-gray-600 font-semibold hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Link>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-5 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={downloadInvoicePDF}
            className="flex items-center gap-2 bg-[var(--primary)] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Invoice Card ─────────────────────────── */}
      <div
        id="invoice-content"
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Green Header */}
        <div className="bg-[var(--primary)] px-10 py-8 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{invoice.storeName}</h1>
            <p className="text-green-100 text-sm mt-1">{invoice.storeAddress}</p>
            <p className="text-green-100 text-sm mt-0.5">{invoice.storeEmail} | {invoice.storePhone}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white font-black text-3xl tracking-wider">INVOICE</p>
            <p className="text-green-100 text-sm mt-1">Order: <span className="font-bold text-white">{invoice.orderId}</span></p>
            <p className="text-green-100 text-sm">Date: <span className="font-bold text-white">{invoice.date}</span></p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-10 py-4 bg-[var(--primary-light)]/40 border-b border-gray-100 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <span className="text-sm font-bold text-[var(--primary)]">Order Paid & Confirmed</span>
          <span className="ml-auto text-xs text-gray-500 font-medium">Transaction ID: <span className="font-bold text-gray-800">{invoice.transaction}</span></span>
        </div>

        <div className="px-10 py-8">

          {/* Billing Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Bill To</h3>
              <p className="font-extrabold text-gray-900 text-base">{invoice.customerName}</p>
              <p className="text-gray-500 text-sm mt-1">{invoice.customerAddress}</p>
              <p className="text-gray-500 text-sm">{invoice.customerEmail}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Order Date",     value: invoice.date },
                { label: "Delivery Date",  value: invoice.delivery },
                { label: "Payment Mode",   value: invoice.payment },
                { label: "Status",         value: "Confirmed ✓" },
              ].map((info, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{info.label}</p>
                  <p className={`font-bold text-sm mt-1 ${info.label === "Status" || info.label === "Delivery Date" ? "text-[var(--primary)]" : "text-gray-900"}`}>
                    {info.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left px-4 py-3 rounded-tl-xl font-bold text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Item</th>
                <th className="text-center px-4 py-3 font-bold text-xs uppercase tracking-wider">Weight</th>
                <th className="text-center px-4 py-3 font-bold text-xs uppercase tracking-wider">Qty</th>
                <th className="text-center px-4 py-3 font-bold text-xs uppercase tracking-wider">Unit Price</th>
                <th className="text-right px-4 py-3 rounded-tr-xl font-bold text-xs uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[var(--primary-light)]/20 transition-colors`}>
                  <td className="px-4 py-4 text-gray-400 font-bold">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-500 font-medium">{item.weight}</td>
                  <td className="px-4 py-4 text-center text-gray-900 font-bold">{item.qty}</td>
                  <td className="px-4 py-4 text-center text-gray-600 font-semibold">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-4 text-right font-extrabold text-gray-900">
                    ${(item.qty * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Shipping</span>
                <span className="text-[var(--primary)] font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Discount Applied</span>
                <span className="text-[var(--primary)] font-bold">- ${invoice.discount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-gray-200 mt-2 pt-4">
                <div className="flex justify-between items-center px-2 py-2">
                  <span className="text-gray-800 font-extrabold text-base uppercase tracking-wide">Total Amount</span>
                  <span className="text-[var(--primary)] font-black text-2xl">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-6 border-t border-gray-100 text-center text-gray-400 text-xs font-medium space-y-1">
            <p className="font-bold text-gray-600">Thank you for shopping at {invoice.storeName}!   </p>
            <p>For support or queries, contact us at <span className="text-[var(--primary)] font-semibold">{invoice.storeEmail}</span></p>
            <p className="mt-2">Invoice generated on {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default InvoicePage;
