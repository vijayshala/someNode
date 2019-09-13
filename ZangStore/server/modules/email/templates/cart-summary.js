const template = `
<div style='padding-top:10px;'><%= L.get('CART_SUMMARY_TITLE1') %></div>

<% if (withExtraInfo) { %>
  <% _.forEach(details.extraInfo, function(info) { %>
    <div style='padding-top:10px;'><%- info %></div>
  <% }) %>
<% } %>

<h4><%= L.get('CART_SUMMARY_DETAILS') %></h4>

<% _.forEach(cart.subscriptions, function(subscription) { %>
  <h3><%= L.get('RECURRING_FEE') %></h3>
<table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
  <thead>
    <tr>
      <th><%= L.get('CONTRACT_LENGTH')%>:</th>
      <th><%- subscription.contractLength %> <%- L.get(subscription.contractPeriod.toUpperCase()) %></th>
    </tr>
<% if (subscription.trialLength) { %>
    <tr>
      <th><%= L.get('TRIAL_LENGTH')%>:</th>
      <th><%- subscription.trialLength %> <%- L.get(subscription.trialPeriod.toUpperCase()) %></th>
    </tr>
<% } %>
    <tr style="border-bottom:1px solid #888888;">
      <th><%= L.get('BILLING_CYCLE')%>:</th>
      <th><%- subscription.billingInterval %> <%- L.get(subscription.billingPeriod.toUpperCase()) %></th>
    </tr>
  </thead>
  <tbody>
<%
_.forEach(cart.items, function(item) {
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
        <td><%= L.get(taxItem.title.text) %></td>
        <td align="right"><%= currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <%
    if (region != 'DE') {
  %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('TOTAL_TAXES') %></td>
      <% if (subscription.taxDetails)  { %>
        <td align="right"><%- currency(subscription.tax) %></td>
      <% } else { %>
        <td align="right">*<%= L.get('PLUS_APPLICABLE_TAX') %></td>
      <% } %>
    </tr>
    <%
      }
  %>
    <tr>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(subscription.shipping) %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- cart.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(subscription.total) %></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td align="right">(<%= L.get('BILLED_ACCORDING_TO_SELECTED_PLAN') %>)</td>
    </tr>
  </tfoot>
</table>

<%}) %>
<% if (hasOneTimeCharge) { %>


<br /><br/>
<%
if (region == 'DE') {
%>
<h4><%= L.get('BUY_OFFER_OF_TENOVIS') %></h4>
<% } else { %>
  <h3><%= L.get('ONETIME_FEE') %></h3>
<% } %>
<table style="width:100%;border-collapse:collapse;text-align:left;border:0;">
  <tbody>
<% _.forEach(cart.items, function(item) { if (item.isOneTimeCharge) { %>
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
      <td align="right"><%- currency(cart.onetime.subTotal) %></td>
    </tr>
    <%
    _.forEach(cart.onetime.taxDetails, function(taxItem)  {
    %>
      <tr>
        <td><%= L.get(taxItem.title.text) %></td>
        <td align="right"><%= currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <%
    if (region != 'DE') {
  %>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('TOTAL_TAXES') %></td>
      <% if (cart.onetime.taxDetails)  { %>
        <td align="right"><%- currency(cart.onetime.tax) %></td>
      <% } else { %>
        <td align="right">*<%= L.get('PLUS_APPLICABLE_TAX') %></td>
      <% } %>
    </tr>
    <%
      }
  %>
    <tr>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(cart.onetime.shipping) %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- cart.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(cart.onetime.total) %></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td align="right">(<%= L.get('ONE_TIME_FEE') %>)</td>
    </tr>
  </tfoot>
</table>
<%} %>

<%
if (region == 'DE') {
%>

<p><%= L.get('CART_INSTRUCTIONS_1') %></p>
<p><%= L.get('CART_INSTRUCTIONS_2') %> <%= L.get('HERE_YOU_WILL_FIND_GSMB_TOS') %></p>
<p><%= L.get('CART_INSTRUCTIONS_3') %></p>
<p><%= L.get('BEST_REGARDS') %></p>
<p><%= L.get('AVAYA_CLOUD_INC') %></p>
<%
}
%>
`;

module.exports = {
  template,
};
