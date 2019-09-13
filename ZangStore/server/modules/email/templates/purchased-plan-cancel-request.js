const template = `
<h2 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;">
  A customer has requested a plan cancellation
</h2>

<p><hr /></p>

<% if (withExtraInfo) { %>
  <% _.forEach(details.extraInfo, function(info) { %>
    <div style='padding-top:10px;'><%- info %></div>
  <% }) %>
<% } %>

<h4><%= L.get('ACCOUNT_INFORMATION') %></h4>
<table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
<% if (order.company && order.company.name) { %>
  <tr>
    <td><%= L.get('COMPANY_NAME') %>:</td>
    <td><%- ((order.company && order.company.name) || "") %> <%- ((order.company && order.company.domain) || "") %><td>
  </tr>
<% } %>
  <tr>
    <td><%= L.get('CONTACT_NAME') %>:</td>
    <td><%- ((order.contact && order.contact.firstName) || "") %> <%- ((order.contact && order.contact.lastName) || "") %> (<%- ((order.contact && order.contact.email) || "") %>)<td>
  </tr>

  <tr>
    <td><%= L.get('PHONE_NUMBER') %>:</td>
    <td><%- ((order.contact && order.contact.phone) || "") %><td>
  </tr>

<% if (order.billingAddress) { %>
  <tr>
    <td><%= L.get('BILLING_INFORMATION') %>:</td>
    <td>
      <%- ((order.billingAddress && order.billingAddress.address1) || "") %>,
      <%- ((order.billingAddress && order.billingAddress.city) || "") %>,
      <%- ((order.billingAddress && order.billingAddress.state) || "") %>,
      <%- ((order.billingAddress && order.billingAddress.zip) || "") %>
    </td>
  </tr>
<% } %>
</table>

<p><hr/></p>

<p>Please click below to view the plan:</p>

<a class="bulletproof-button" href="<%=purchased_plan_url%>" 
style="text-transform:uppercase; color: #ffffff; font-weight:600; padding: 12px 18px 12px 18px; 
text-decoration: none;display: block; background-color:#C00; text-align:center" target="_blank" rel="noopener noreferrer">View Plan</a>

<p style="padding-top:10px;">- Thank you for choosing Avaya.</p>
`;

module.exports = {
  template,
};
