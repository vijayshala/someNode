const template = `
<div style='padding-top:10px;'><%= L.get('CUSTOMER_QUOTE_TITLE1') %></div>

<% if (withExtraInfo) { %>
  <% _.forEach(details.extraInfo, function(info) { %>
    <div style='padding-top:10px;'><%- info %></div>
  <% }) %>
<% } %>

<% if (partnerAgentUser && partnerAgentUser.account && partnerAgentUser.account.displayname) { %>  
  <h4><%= L.get('QUOTE_PREPARED_BY') %>: <%- partnerAgentUser.account.displayname%></h4>
<% } %>

<h4><%= L.get('CONTACT_INFORMATION') %></h4>
<table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
<% if (quote.company && quote.company.name) { %>
  <tr>
    <td><%= L.get('COMPANY_NAME') %>:</td>
    <td><%- ((quote.company && quote.company.name) || "") %> <%- ((quote.company && quote.company.domain) || "") %><td>
  </tr>
<% } %>
  <tr>
    <td><%= L.get('CONTACT_NAME') %>:</td>
    <td><%- ((quote.contact && quote.contact.firstName) || "") %> <%- ((quote.contact && quote.contact.lastName) || "") %> (<%- ((quote.contact && quote.contact.email) || "") %>)<td>
  </tr>

  <tr>
    <td><%= L.get('PHONE_NUMBER') %>:</td>
    <td><%- ((quote.contact && quote.contact.phone) || "") %><td>
  </tr>

<% if (quote.billingAddress) { %>
  <tr>
    <td><%= L.get('BILLING_INFORMATION') %>:</td>
    <td>
      <%- ((quote.billingAddress && quote.billingAddress.address1) || "") %>,
      <%- ((quote.billingAddress && quote.billingAddress.city) || "") %>,
      <%- ((quote.billingAddress && quote.billingAddress.state) || "") %>,
      <%- ((quote.billingAddress && quote.billingAddress.zip) || "") %>
    </td>
  </tr>
<% } %>

<% if (quote.shippingAddress) { %>
  <tr>
    <td><%= L.get('SHIPPING_INFORMATION') %>:</td>
    <td>
      <%- ((quote.shippingAddress && quote.shippingAddress.address1) || "") %>,
      <%- ((quote.shippingAddress && quote.shippingAddress.city) || "") %>,
      <%- ((quote.shippingAddress && quote.shippingAddress.state) || "") %>,
      <%- ((quote.shippingAddress && quote.shippingAddress.zip) || "") %>
    </td>
  </tr>
<% } %>
</table>

<h4><%= L.get('QUOTE_DETAILS') %></h4>

<% _.forEach(quote.subscriptions, function(subscription) { %>
  <h3><%= L.get('RECURRING_FEE') %></h3>
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
      <th>Billing Cycle:</th>
      <th><%- subscription.billingInterval %> <%- subscription.billingPeriod %></th>
    </tr>
  </thead>
  <tbody>
<%

_.forEach(quote.items, function(item) {
  if(item.isOneTimeCharge) {
    hasOneTimeCharge=true
  }
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
        <td><%- L.get(taxItem.title.text) %></td>
        <td align="right"><%- currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <%
    if (region != 'DE') {
    %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('TOTAL_TAXES') %>*</td>
      <td align="right"><%- currency(subscription.tax) %></td>
    </tr>
    <%
      }
    %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('ESTIMATED_TAX_VALUE') %></td>
      <td align="right"></td>
    </tr>
    <tr>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(subscription.shipping) %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- quote.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(subscription.total) %></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td align="right">(Billed <%= L.get('ACCORDING_TO_PLAN') %>)</td>
    </tr>
  </tfoot>
</table>

<%}) %>
<% if (hasOneTimeCharge) { %>


<br /><br/>
<h3><%= L.get('ONETIME_FEE') %></h3>
<table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
  <tbody>
<% _.forEach(quote.items, function(item) { if (item.isOneTimeCharge) { %>
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
      <td align="right"><%- currency(quote.onetime.subTotal) %></td>
    </tr>
    <%
    _.forEach(quote.onetime.taxDetails, function(taxItem)  {
    %>
      <tr>
        <td><%= L.get(taxItem.title.text) %></td>
        <td align="right"><%- currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <%
    if (region != 'DE') {
  %>
  <tr style="border-top:1px solid #888888;">
  <td><%= L.get('TOTAL_TAXES') %>*</td>
  <td align="right"><%- currency(quote.onetime.tax) %></td>
</tr>
  <%
    }
  %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('ESTIMATED_TAX_VALUE') %></td>
      <td align="right"></td>
    </tr>
    <tr>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(quote.onetime.shipping) %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- quote.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(quote.onetime.total) %></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td align="right">(<%= L.get('ONE_TIME_FEE') %>)</td>
    </tr>
  </tfoot>
</table>
<%} %>
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
