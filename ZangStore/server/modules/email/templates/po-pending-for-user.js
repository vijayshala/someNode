const template = `
<h2 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;">
  Purchase Order Request Received for <%- COMPANY_NAME %>
</h2>

<p><hr /></p>

<p>
We have received your purchase order request. Please allow 3-5 business days for the approval process to complete.
Once your purchase order is approved, any pending orders created using this purchase order will complete their setup automatically.
</p>

<p>If you have any questions or concerns please contact <%= CUSTOMER_SERVICE_EMAIL%> for assistance.</p>

<p style="padding-top:10px;">- Thank you for choosing Avaya.</p>
`;

module.exports = {
  template,
};
