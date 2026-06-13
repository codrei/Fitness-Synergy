// Mobile-safe receipt printing.
//
// Renders the receipt into a hidden same-origin <iframe> and triggers print
// from inside it. Works on mobile Safari and PWAs where window.open() is blocked.
//
// SECURITY: Every value interpolated into HTML below goes through escapeHtml().
// The iframe is same-origin via srcdoc — an unescaped script tag here would
// execute with access to the parent's localStorage (auth token).

const SIGNATURE_REQUIRED_METHODS = ["Bank Transfer", "Credit Card", "Debit Card"];

const formatPeso = (n) =>
  parseFloat(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });

// HTML entity encoder. Covers the OWASP "essential 5" plus backtick for safety.
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"'`]/g, (ch) => ESC_MAP[ch]);

function buildReceiptHTML(payment, member) {
  const safeMethod = escapeHtml(payment.payment_method || "");
  const paymentRow = payment.payment_method
    ? `<tr><td>${safeMethod}</td><td>₱${formatPeso(payment.amount)}</td></tr>`
    : "";

  const bonusDays = parseInt(payment.bonus_days || 0, 10);
  const bonusRow =
    bonusDays > 0
      ? `<tr><td>Bonus Days</td><td>+${bonusDays} day${bonusDays > 1 ? "s" : ""} (FREE)</td></tr>`
      : "";

  const requiresSignature = SIGNATURE_REQUIRED_METHODS.includes(payment.payment_method);
  const signatureBlock = requiresSignature
    ? `<hr>
       <div style="font-size:11px;margin-top:6px">
         <strong>SIGNATURE REQUIRED</strong><br>
         By signing below, the client confirms this ${safeMethod} transaction.<br><br>
         <div style="border-bottom:1px solid #000;margin-top:28px;width:100%"></div>
         <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:3px">
           <span>Client Signature</span><span>Date</span>
         </div>
       </div>`
    : "";

  const printedAt = new Date();
  return `<!DOCTYPE html><html><head><title>Receipt</title>
  <style>
    @media print { @page { margin: 8mm; } }
    body { font-family: monospace; width: 320px; margin: 20px auto; font-size: 13px; color: #000; }
    h2 { text-align: center; margin: 0; font-size: 16px; }
    .sub { text-align: center; color: #555; font-size: 11px; margin-bottom: 12px; }
    hr { border: none; border-top: 1px dashed #999; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 3px 0; }
    td:last-child { text-align: right; }
    .total { font-weight: bold; font-size: 15px; }
    .footer { text-align: center; margin-top: 14px; font-size: 11px; color: #777; }
  </style></head><body>
  <h2>FITNESS SYNERGY LIPA</h2>
  <div class="sub">Official Payment Receipt</div>
  <hr>
  <table>
    <tr><td>Receipt #</td><td>${escapeHtml(payment.payment_id)}</td></tr>
    <tr><td>Date</td><td>${escapeHtml(new Date(payment.payment_date).toLocaleDateString())}</td></tr>
    <tr><td>Time</td><td>${escapeHtml(printedAt.toLocaleTimeString())}</td></tr>
    <tr><td>Member</td><td>${escapeHtml(member.full_name)}</td></tr>
    ${member.address ? `<tr><td>Address</td><td style="text-align:right;max-width:160px;word-break:break-word">${escapeHtml(member.address)}</td></tr>` : ""}
    <tr><td>Plan</td><td>${escapeHtml(payment.plan_name || member.plan_name || "—")}</td></tr>
    ${bonusRow}
    ${member.discount_type && member.discount_type !== "None" ? `<tr><td>Discount</td><td>${escapeHtml(member.discount_type)}</td></tr>` : ""}
  </table>
  <hr>
  <table>${paymentRow || '<tr><td colspan="2">—</td></tr>'}</table>
  <hr>
  <table><tr class="total"><td>TOTAL PAID</td><td>₱${formatPeso(payment.amount)}</td></tr></table>
  ${payment.reference_number ? `<hr><div style="font-size:11px">Ref #: ${escapeHtml(payment.reference_number)}</div>` : ""}
  ${signatureBlock}
  <div class="footer">Thank you for choosing Fitness Synergy Lipa!<br>Keep this receipt for your records.</div>
  </body></html>`;
}

export function printReceipt(payment, member) {
  const html = buildReceiptHTML(payment, member);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 500);
  };

  const triggerPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error("Receipt print failed:", err);
    } finally {
      cleanup();
    }
  };

  if ("srcdoc" in iframe) {
    iframe.onload = triggerPrint;
    iframe.srcdoc = html;
  } else {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(triggerPrint, 200);
  }
}
