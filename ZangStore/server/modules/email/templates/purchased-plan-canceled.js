const template = `
<h2 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;">
  Your plan has been canceled successfully
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

<p><hr /></p>

<% _.forEach(order.subscriptions, function(subscription) { %>
  <table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
  <tbody>
<%
_.forEach(order.items, function(item) {
  if (!item.isOneTimeCharge && item.salesModel && item.salesModel.subscription && generateSubscriptionIdentifier(item.salesModel.subscription) === subscription.identifier) {
%>
    <tr>
      <td>
        <%= '&nbsp;&nbsp;'.repeat(item.level || 0) %>
        <%= (item.level === 0 ? '<b>' : '') %><%- LV(item.title) %><%= (item.level === 0 ? '</b>' : '') %>
        <% if (item.price) { %>@ <%- currency(item.price) %><% } %>
        <% if (item.quantity && item.quantity > 1) { %>x <%- item.quantity %><% } %>
        <% if (item.additionalInformation && item.additionalInformation.text) { %>: <%- item.additionalInformation.text %><% } %>
      </td>
      <% if (item.price && item.quantity && item.quantity > 0) { %>
        <td align="right"><%- currency((item.price || 0) * item.quantity) %></td>
      <% } else { %>
        <td align="right">-</td>
      <% } %>
    </tr>
<% } }) %>
  </tbody>
  <tfoot>
    <tr style="border-top:1px solid #888888;border-bottom:1px solid #888888;">
      <td><%= L.get('SUB_TOTAL') %></td>
      <td align="right"><%- currency(subscription.subTotal) %></td>
    </tr>
    <%
    _.forEach(subscription.taxDetails, function(taxItem)  {
    %>
      <tr>
        <td><%= L.get(taxItem.title.text) %></td>
        <td align="right"><%= currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('TOTAL_TAXES') %></td>
      <td align="right"><%- currency(subscription.tax) %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- order.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(subscription.total) %></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td align="right">(<%= L.get('CANCELED') %>)</td>
    </tr>
  </tfoot>
</table>
<% }) %>

<p style="padding-top:10px;">- Thank you for choosing Avaya.</p>
`;

module.exports = {
  template,
};
