const template = `
<h2 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;">
  Purchase Order Request Approved for <%- COMPANY_NAME %>
</h2>

<p><hr /></p>

<p>
Your purchase order has been approved with a limit of $<%- PO_LIMIT %>. Any orders created with this purchase order will complete automatically and you should receive any associated confirmation emails shortly.
</p>

<p>If you have any questions or concerns please contact <%= CUSTOMER_SERVICE_EMAIL%> for assistance.</p>

<p style="padding-top:10px;">- Thank you for choosing Avaya.</p>
`;

module.exports = {
  template,
};
