<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.text.NumberFormat, java.text.SimpleDateFormat, java.util.*, java.util.Locale" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice - ShopEase</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f4f6fb;
      color: #222;
      font-size: 14px;
      line-height: 1.6;
    }

    .invoice-wrapper {
      max-width: 760px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }

    /* Header */
    .invoice-header {
      background: linear-gradient(135deg, #6c63ff, #5147e8);
      color: white;
      padding: 36px 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .brand-name {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .brand-tagline {
      font-size: 13px;
      opacity: 0.8;
      margin-top: 2px;
    }

    .invoice-label {
      text-align: right;
    }

    .invoice-label h2 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .invoice-label p {
      opacity: 0.85;
      font-size: 13px;
      margin-top: 4px;
    }

    /* Body */
    .invoice-body { padding: 36px 40px; }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      margin-bottom: 32px;
    }

    .info-block h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #888;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 6px;
    }

    .info-block p {
      font-size: 14px;
      color: #333;
      line-height: 1.7;
    }

    .info-block strong { color: #111; }

    /* Status Badge */
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-paid { background: #e6f9f2; color: #00a36c; border: 1px solid #b2e8d4; }
    .status-pending { background: #fff8e6; color: #c47a00; border: 1px solid #f0d88a; }
    .status-cancelled { background: #ffeaea; color: #cc2929; border: 1px solid #f0b2b2; }

    /* Items Table */
    .items-section { margin-bottom: 28px; }
    .items-section h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #888;
      margin-bottom: 12px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table thead tr {
      background: #f8f9ff;
      border-bottom: 2px solid #e8eaf0;
    }

    .items-table th {
      padding: 10px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #777;
    }

    .items-table th:last-child, .items-table td:last-child { text-align: right; }

    .items-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f0f2f8;
      color: #333;
    }

    .items-table tbody tr:hover { background: #fafbff; }
    .items-table tbody tr:last-child td { border-bottom: none; }

    .item-name { font-weight: 600; color: #222; }
    .item-qty { color: #666; }

    /* Totals */
    .totals-section {
      border-top: 2px solid #f0f2f8;
      padding-top: 20px;
      margin-top: 8px;
    }

    .total-row {
      display: flex;
      justify-content: flex-end;
      gap: 48px;
      padding: 5px 14px;
      font-size: 14px;
      color: #555;
    }

    .total-row span:last-child { min-width: 100px; text-align: right; }

    .total-row.grand-total {
      background: linear-gradient(135deg, #f0eeff, #ece8ff);
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 8px;
      font-size: 16px;
      font-weight: 800;
      color: #6c63ff;
    }

    /* Footer */
    .invoice-footer {
      background: #f8f9ff;
      padding: 24px 40px;
      text-align: center;
      color: #888;
      font-size: 12px;
      border-top: 1px solid #e8eaf0;
    }

    .invoice-footer strong { color: #6c63ff; }

    /* Print */
    @media print {
      body { background: white; }
      .invoice-wrapper { box-shadow: none; margin: 0; border-radius: 0; }
    }
  </style>
</head>
<body>

<%
  // ─────────── Demo data – replace with real request attributes ───────────
  String orderId       = (String) request.getAttribute("orderId");
  String customerName  = (String) request.getAttribute("customerName");
  String customerEmail = (String) request.getAttribute("customerEmail");
  String orderDate     = (String) request.getAttribute("orderDate");
  String paymentStatus = (String) request.getAttribute("paymentStatus");
  String orderStatus   = (String) request.getAttribute("orderStatus");
  String shippingAddr  = (String) request.getAttribute("shippingAddress");

  if (orderId == null)       orderId       = "INV-" + System.currentTimeMillis();
  if (customerName == null)  customerName  = "John Smith";
  if (customerEmail == null) customerEmail = "john@example.com";
  if (orderDate == null)     orderDate     = new SimpleDateFormat("MMMM d, yyyy", Locale.US).format(new Date());
  if (paymentStatus == null) paymentStatus = "paid";
  if (orderStatus == null)   orderStatus   = "processing";
  if (shippingAddr == null)  shippingAddr  = "123 Main St, New York, NY 10001, US";

  // Items – in production pass as List<Map> attribute
  String[][] items = {
    { "Premium Wireless Headphones", "1", "79.99", "79.99" },
    { "USB-C Fast Charging Cable (2-pack)", "2", "12.99", "25.98" },
    { "Portable Bluetooth Speaker", "1", "49.99", "49.99" },
  };

  double subtotal    = 155.96;
  double shipping    = 0.00;
  double tax         = 15.60;
  double totalAmount = 171.56;

  NumberFormat currency = NumberFormat.getCurrencyInstance(Locale.US);
  String statusClass = "status-" + paymentStatus.toLowerCase();
%>

<div class="invoice-wrapper">

  <!-- Header -->
  <div class="invoice-header">
    <div>
      <div class="brand-name">ShopEase</div>
      <div class="brand-tagline">Premium E-Commerce Platform</div>
    </div>
    <div class="invoice-label">
      <h2>Invoice</h2>
      <p><%= orderId %></p>
      <p><%= orderDate %></p>
    </div>
  </div>

  <!-- Body -->
  <div class="invoice-body">

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-block">
        <h3>Bill To</h3>
        <p>
          <strong><%= customerName %></strong><br/>
          <%= customerEmail %><br/>
          <%= shippingAddr %>
        </p>
      </div>
      <div class="info-block">
        <h3>Order Info</h3>
        <p>
          <strong>Order ID:</strong> <%= orderId %><br/>
          <strong>Date:</strong> <%= orderDate %><br/>
          <strong>Payment:</strong>
          <span class="status-badge <%= statusClass %>"><%= paymentStatus.toUpperCase() %></span><br/>
          <strong>Status:</strong> <%= orderStatus %>
        </p>
      </div>
    </div>

    <!-- Items -->
    <div class="items-section">
      <h3>Items Ordered</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <%
            int rowNum = 1;
            for (String[] item : items) {
          %>
          <tr>
            <td><%= rowNum++ %></td>
            <td class="item-name"><%= item[0] %></td>
            <td class="item-qty"><%= item[1] %></td>
            <td>$<%= item[2] %></td>
            <td><strong>$<%= item[3] %></strong></td>
          </tr>
          <% } %>
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal</span>
        <span><%= currency.format(subtotal) %></span>
      </div>
      <div class="total-row">
        <span>Shipping</span>
        <span><%= shipping == 0 ? "Free" : currency.format(shipping) %></span>
      </div>
      <div class="total-row">
        <span>Tax (10%)</span>
        <span><%= currency.format(tax) %></span>
      </div>
      <div class="total-row grand-total">
        <span>Total Amount</span>
        <span><%= currency.format(totalAmount) %></span>
      </div>
    </div>

  </div><!-- /invoice-body -->

  <!-- Footer -->
  <div class="invoice-footer">
    <p>Thank you for shopping with <strong>ShopEase</strong>! &nbsp;&bull;&nbsp; Questions? Contact <strong>support@shopease.com</strong></p>
    <p style="margin-top:6px;">This invoice was generated automatically. &nbsp; Payments secured by <strong>Stripe</strong>.</p>
  </div>

</div>

</body>
</html>
