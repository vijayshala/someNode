const template = `
<h2 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;">
  A New Purchase Order is Pending Approval
</h2>

<p><hr /></p>

<p>Please click below to see all purchase orders that are pending approval:</p>

<a class="bulletproof-button" href="<%=po_approval_url%>" 
style="text-transform:uppercase; color: #ffffff; font-weight:600; padding: 12px 18px 12px 18px; 
text-decoration: none;display: block; background-color:#C00; text-align:center" target="_blank" rel="noopener noreferrer">Pending Purchase Orders</a>

<p style="padding-top:10px;">- Thank you for choosing Avaya.</p>
`;

module.exports = {
  template,
};
