const template = `
<% if (hasProvisioning) { %>
  <div style='padding-top:10px;'><%= L.get('THANK_YOU_FOR_SHOPPING_WITH_US_WE_LL_SEND_A_CONFIRMATION_ONCE_YOUR_ITEMS_HAVE_SHIPPED_YOUR_ORDER_DETAILS_ARE_INDICATED_BELOW') %> <%= L.get('ORDER_CUSTOMER_SERVICE_SYSTEM_SETUP_INFO') %></div>
<% } else if (isInvoice) { %>
  <div style='padding-top:10px'><%= L.get('SUBSCRIPTION_RENEWAL') %></div>
<% } else { %>
  <div style='padding-top:10px'><%= L.get('THANK_YOU_FOR_SHOPPING_WITH_US_YOUR_ORDER_DETAILS_ARE_INDICATED_BELOW') %></div>
<% } %>

<% if (withExtraInfo) { %>
  <% _.forEach(details.extraInfo, function(info) { %>
    <div style='padding-top:10px;'><%- info %></div>
  <% }) %>
<% } %>

<h4><%= L.get('CUSTOMER_INFORMATION') %></h4>
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
      <%- ((order.billingAddress && order.billingAddress.state ? order.billingAddress.state + "," : "")) %>
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
      <%- ((order.shippingAddress && order.shippingAddress.state ? order.shippingAddress.state + "," : "")) %>
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

<% if (isInvoice) { %>
  <h4><%= L.get('SUBSCRIPTION_DETAILS') %></h4>
<% } else { %>
  <h4><%= L.get('ORDER_DETAILS') %></h4>
<% } %>

<% _.forEach(order.subscriptions, function(subscription) { %>

<table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
  <thead>
    <tr>
      <th>Contract Length:</th>
      <th><%- subscription.contractLength %> <%- subscription.contractPeriod %></th>
    </tr>
<% if (subscription.trialLength) { %>
    <tr>
      <th>Trial Length:</th>
      <th><%- subscription.trialLength %> <%- subscription.trialPeriod %></th>
    </tr>
<% } %>
    <tr style="border-bottom:1px solid #888888;">
      <% if (subscription.payment && subscription.payment.next && subscription.payment.on) { %>
        <th>Billing Interval:</th>
        <th><%- moment(subscription.payment.on).format('YYYY-MM-DD') %> <%= L.get('TO') %> <%- moment(subscription.payment.next).format('YYYY-MM-DD') %></th>
      <% } else { %>
        <th>Billing Cycle:</th>
        <th><%- subscription.billingInterval %> <%- subscription.billingPeriod %></th>
      <% } %>
    </tr>
  </thead>
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
        <td align="right"><%- currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('TOTAL_TAXES') %></td>
      <td align="right"><%- currency(subscription.tax) %></td>
    </tr>
    <tr>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(subscription.shipping) %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- order.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(subscription.total) %></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td align="right">(Billed <%= L.get('ACCORDING_TO_PLAN') %>)</td>
    </tr>
  </tfoot>
</table>
<% }) %>

`;

// <% _.forEach(subscription.taxDetails, function(tax) { %>
//     <tr>
//       <td><%- tax.title.text %></td>
//       <td align="right"><%- currency(tax.amount) %></td>
//     </tr>
// <% }) %>


module.exports = {
  template,
};
