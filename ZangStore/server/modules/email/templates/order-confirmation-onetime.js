const template = `

<% if (hasProvisioning) { %>
  <div style='padding-top:10px;'><%= L.get('THANK_YOU_FOR_SHOPPING_WITH_US_WE_LL_SEND_A_CONFIRMATION_ONCE_YOUR_ITEMS_HAVE_SHIPPED_YOUR_ORDER_DETAILS_ARE_INDICATED_BELOW') %> <%= L.get('ORDER_CUSTOMER_SERVICE_SYSTEM_SETUP_INFO') %></div>
<% } else { %>
  <div style='padding-top:10px'><%= L.get('THANK_YOU_FOR_SHOPPING_WITH_US_YOUR_ORDER_DETAILS_ARE_INDICATED_BELOW') %></div>
<% } %>

<% if (withExtraInfo) { %>
  <% _.forEach(details.extraInfo, function(info) { %>
    <div style='padding-top:10px;'><%- info %></div>
  <% }) %>
<% } %>

<div style='padding-top:10px;'><%= L.get('QUESTION_CUSTOMER_SERVICE').replace(/\{SUPPORT_EMAIL\}/g, supportEmail) %></div>

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

<% if (order.shippingAddress) { %>
  <tr>
    <td><%= L.get('SHIPPING_INFORMATION') %>:</td>
    <td>
      <%- ((order.shippingAddress && order.shippingAddress.address1) || "") %>,
      <%- ((order.shippingAddress && order.shippingAddress.city) || "") %>,
      <%- ((order.shippingAddress && order.shippingAddress.state) || "") %>,
      <%- ((order.shippingAddress && order.shippingAddress.zip) || "") %>
    </td>
  </tr>
<% } %>

  <tr>
    <td colspan='5'><%= L.get('ADDITIONAL_NOTES') %>:</td>
  <tr>
  </tr>
    <td colspan='5'><%- (order.notes || "") %></td>
  </tr>
</table>

<h4><%= L.get('ORDER_DETAILS') %></h4>

<table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
  <tbody>
<% _.forEach(order.items, function(item) { if (item.isOneTimeCharge) { %>
    <tr>
      <td>
        <%- LV(item.title) %>
        <% if (item.price) { %>@ <%- currency(item.price) %><% } %>
        <% if (item.quantity && item.quantity > 1) { %>x <%- item.quantity %><% } %>
        <% if (item.additionalInformation && item.additionalInformation.text) { %>: <%- item.additionalInformation.text %><% } %>
      </td>
      <td align="right"><%- currency((item.price || 0) * item.quantity) %></td>
    </tr>
<% } }) %>
  </tbody>
  <tfoot>
    <tr style="border-top:1px solid #888888;border-bottom:1px solid #888888;">
      <td><%= L.get('SUB_TOTAL') %></td>
      <td align="right"><%- currency(order.onetime.subTotal) %></td>
    </tr>
    <%
    _.forEach(order.onetime.taxDetails, function(taxItem)  {
    %>
      <tr>
        <td><%= L.get(taxItem.title.text) %></td>
        <td align="right"><%- currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('TOTAL_TAXES') %></td>
      <td align="right"><%- currency(order.onetime.tax) %></td>
    </tr>
    <tr>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(order.onetime.shipping) %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- order.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(order.onetime.total) %></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td align="right">(<%= L.get('ONE_TIME_FEE') %>)</td>
    </tr>
  </tfoot>
</table>

`;

// <% _.forEach(order.onetime.taxDetails, function(tax) { %>
//     <tr>
//       <td><%- tax.title.text %></td>
//       <td align="right"><%- currency(tax.amount) %></td>
//     </tr>
// <% }) %>


module.exports = {
  template,
};
