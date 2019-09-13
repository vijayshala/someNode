const template = `
<h2 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;"><%- L.get('ORDER_CONFIRMATION') %></h2>

<% if (region == 'DE') { %>

  <p><%= L.get('SALUTATIONS') %> <%- contactName %>,</p>
  <p><%- L.get('THANK_YOU_FOR_CHOOSING_AVAYA_GSMB') %></p>
  <p><%= L.get('IN_PARALLEL_TO_THIS_GSMB_EMAIL') %></p>
  <p><%= L.get('IF_YOU_ASKED_TO_PORT_GSMB').replace(/\{SUPPORT_EMAIL\}/g, supportEmail) %></p>
  <p><%- L.get('BEST_REGARDS') %></p>
  <p><%- L.get('AVAYA_CLOUD_INC') %></p>
  <p><%- L.get('PS_IN_THE_FOLLOWING_GSMB').replace(/\{ORDER_NUMBER\}/g, order.confirmationNumber).replace(/\{ORDER_DATE\}/g, (new Date(order.created.on).toLocaleDateString(language, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }))) %></p>

<% } else { %>
  <p><%= L.get('SALUTATIONS') %> <%- contactName %>,</p>

  <p><%- L.get('THANK_YOU_FOR_SHOPPING_WITH_US_WE_LL_SEND_A_CONFIRMATION_ONCE_YOUR_ITEMS_HAVE_SHIPPED_YOUR_ORDER_DETAILS_ARE_INDICATED_BELOW') %></p>
  <p><%= L.get('FULL_ORDER_HISTORY').replace(/\{PROFILE_LINK\}/g, profile_link) %></p>

  <br/>

  <p><%= L.get('QUESTION_CUSTOMER_SERVICE').replace(/\{SUPPORT_EMAIL\}/g, supportEmail) %></p>
<% }  %>
<hr/>

<div style="display:flex; justify-content: space-around;">
  <div style="margin-left:10px;margin-right:20px;max-width:49%">
    <h4><%= L.get('BILLING_INFORMATION') %>:</h4>
    <%- order.contact.firstName + ' ' + order.contact.lastName %><br />
    <%- order.company.name %><br />
    <%- order.billingAddress.address1 %><br />
    <%- order.billingAddress.city + ', ' + (order.billingAddress.state ? order.billingAddress.state + ', ' : '') +  order.billingAddress.zip + ', ' +  order.billingAddress.country %>
  </div>
  <div style="margin-left:10px;max-width:49%">
    <div>
      <h4><%= L.get('SHIPPING_INFORMATION') %>:</h4>
          <%- order.shippingAddress.address1 %><br />
          <%- order.shippingAddress.city + ', ' + (order.shippingAddress.state ? order.shippingAddress.state + ', ' : '') +  order.shippingAddress.zip + ', ' +  order.shippingAddress.country %>
      </div>
    <div>
      <% if (partnerAgentUser && partnerAgentUser.account && partnerAgentUser.account.displayname) { %>  
        <h4><%= L.get('AGENT') %></h4>
        <%- partnerAgentUser.account.displayname %><br />
        <%- (partnerDetails && partnerDetails.fields && partnerDetails.fields.companyName) %>
      <% } %>
    </div>
    <div>
      <h4><%= L.get('ORDER_DETAILS') %></h4>
      <%-  L.get('DATE') + ': ' + (new Date(order.created.on).toLocaleDateString(language, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }))  %><br /> 
      <%-  L.get('ORDER_NUMBER') + ': ' + order.confirmationNumber %><br />
    </div>
  </div>
</div>

<br />

<% if (order.notes && order.notes != '') { %>  
  <div style="margin-left:10px;margin-bottom: 1em; width: 90%;">
    <h4><%= L.get('ADDITIONAL_NOTES') %></h4>
    <%- order.notes %>
  </div>
<% } %>

<h2 style="margin:0; margin-top:3em; line-height:1.3; font-weight: 500;text-align:center;"><%- LV(order.items[0].title) %> | <%- L.get('SUBSCRIPTIONS') %></h2>

<% _.forEach(order.subscriptions, function(subscription) { %>
  
  <table style="padding-top:2em;width:100%;">
  <thead>
    <tr style="background: #f2f2f2">
      <td style="padding-left: 1em; width:49%">
        <%= L.get('CONFIRMATION') %> #
      </td>
      <td style="padding-left: 1em; width:49%" colspan="2">
        <%= L.get('PAYMENT_METHOD') %>
      </td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding-left: 1em">
        <%= order.confirmationNumber %>
      </td>
      <td style="padding-left: 1em" colspan="2">
        <%= L.get((order.payment.metadata.paymentType ? order.payment.metadata.paymentType  : 'IBAN')) + " " + (paymentDetails) + ' - ' + L.get('BILLED_MONTH') %>
      </td>
    </tr>
    <tr>
      <td style="border-top:1px solid #888888;" colspan="3"></td>
    </tr>
    <tr>
      <td>
        <%= LV(order.items[0].title) %>
      </td>
      <td align="center">
        <%= L.get('QTY') %>
      </td>
      <td align="right">
        <%= L.get('RECURRING_CHARGES') %>
      </td>
    </tr>
    <tr>
      <td style="border-top:1px solid #888888;" colspan="3"></td>
    </tr>
  <%
  _.forEach(order.items, function(item) {
    if (!item.isOneTimeCharge && item.salesModel && item.salesModel.subscription && generateSubscriptionIdentifier(item.salesModel.subscription) === subscription.identifier) {
  %>
      <tr>
        <td>
          <%= '&nbsp;&nbsp;'.repeat(item.level || 0) %>
          <%= (item.level != 0 ? LV(item.title) : '') %>
          <% if (item.price) { %>@ <%- currency(item.price) %><% } %>
          <% if (item.additionalInformation && item.additionalInformation.text) { %>: <%- item.additionalInformation.text %><% } %>
        </td>
        <% if (item.price && item.quantity && item.quantity > 0) { %>
          <td align="center"><%- item.quantity %></td>
          <td align="right"><%- currency((item.price || 0) * item.quantity) %></td>
        <% } else if (item.level != 0) { %>
          <td align="center"><% if (item.quantity && item.quantity >= 1) { %><%- item.quantity %><% } %></td>
          <td align="right">-</td>
        <% } %>
      </tr>
  <% } }) %>
    </tbody>
    <tfoot>
      <tr>
        <td></td>
        <td><%= L.get('SUB_TOTAL') %></td>
        <td align="right"><%- currency(subscription.subTotal) %></td>
      </tr>
      <%
      _.forEach(subscription.taxDetails, function(taxItem)  {
      %>
        <tr>
          <td></td>
          <td><%= L.get(taxItem.title.text) %></td>
          <td align="right"><%- currency(taxItem.amount) %></td>
        </tr>
      <% }) %>
      <%
      if (region != 'DE') {
    %>
    <tr>
      <td></td>
      <td><%=  L.get('TOTAL_TAXES') %></td>
      <td align="right"><%- currency(subscription.tax) %></td>
    </tr>
    <%
      }
    %>
      <tr>
        <td></td>
        <td><%= L.get('FREE_SHIPPING') %></td>
        <td align="right"><%- currency(subscription.shipping) %></td>
      </tr>
      <tr>
        <td></td>
        <td style="border-top:1px solid #888888;" colspan="2"></td>
      </tr>
      <tr>
        <td></td>
        <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- order.currency %>)</td>
        <td style="text-align:right;font-weight:bold;"><%- currency(subscription.total) %></td>
      </tr>
      <tr>
        <td></td>
        <td align="center" colspan="2">*<%= L.get('RECURRING_FEE') %></td>
      </tr>
    </tfoot>
  </table>
<% }) %>

<br />

<%
  if (order.onetime && order.onetime.taxDetails && order.onetime.taxDetails.length > 0  ) {
%>
<% if (region == 'DE') { %>
  <h2 style="margin:0; margin-top: 3em; line-height:1.3; font-weight: 500;text-align:center;"><%- LV(order.items[0].title) %></h2>
  <h4 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;"><%= L.get('WE_HAVE_FORWARDED_PARTNER_GSMB') %></h4>
  <%  } else { %>
    <h2 style="margin:0; margin-top: 3em; line-height:1.3; font-weight: 500;text-align:center;"><%- LV(order.items[0].title) %> | <%- L.get('ONE_TIME') %></h2>
    <%  }  %>
  <table style="padding-top:2em;width:100%;">
  <thead>
    <tr style="background: #f2f2f2">
      <td style="padding-left: 1em; width:49%">
        <%= L.get('CONFIRMATION') %> #
      </td>
      <td style="padding-left: 1em; width:49%; max-width: 49%" colspan="2">
        <%= L.get('PAYMENT_METHOD') %>
      </td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding-left: 1em">
        <%= order.confirmationNumber %>
      </td>
      <td style="padding-left: 1em" colspan="2">
        <%= L.get((order.payment.metadata.paymentType ? order.payment.metadata.paymentType  : 'IBAN')) + " " + (paymentDetails) + ' - ' + L.get('ONE_TIME') %>
        </td>
    </tr>
    <tr>
      <td style="border-top:1px solid #888888;" colspan="3"></td>
    </tr>
    <tr>
      <td>
        <%= L.get('DEVICES') %>
      </td>
      <td align="center">
        <%= L.get('QTY') %>
      </td>
      <td align="right">
        <%= L.get('ONE_TIME_CHARGE') %>
      </td>
    </tr>
    <tr>
      <td style="border-top:1px solid #888888;" colspan="3"></td>
    </tr>
  <% _.forEach(order.items, function(item) { if (item.isOneTimeCharge) { %>
    <tr>
      <td>
        <%- LV(item.title) %>
        <% if (item.price) { %>@ <%- currency(item.price) %><% } %>
        <% if (item.additionalInformation && item.additionalInformation.text) { %>: <%- item.additionalInformation.text %><% } %>
      </td>
      <td align="center"> <% if (item.quantity && item.quantity >= 1) { %><%- item.quantity %><% } %></td>
      <td align="right"><%- currency((item.price || 0) * item.quantity) %></td>
    </tr>
  <% } }) %>
  </tbody>
  <tfoot>
    <tr>
      <td></td>
      <td><%= L.get('SUB_TOTAL') %></td>
      <td align="right"><%- currency(order.onetime.subTotal) %></td>
    </tr>
    <%
    _.forEach(order.onetime.taxDetails, function(taxItem)  {
    %>
      <tr>
        <td></td>
        <td><%= L.get(taxItem.title.text) %></td>
        <td align="right"><%- currency(taxItem.amount) %></td>
      </tr>
    <% }) %>
    <%
      if (region != 'DE') {
    %>
    <tr>
      <td></td>
      <td><%=  L.get('TOTAL_TAXES') %></td>
      <td align="right"><%- currency(order.onetime.tax) %></td>
    </tr>
    <%
      }
    %>
    <tr>
      <td></td>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(order.onetime.shipping) %></td>
    </tr>
    <tr>
      <td></td>
      <td style="border-top:1px solid #888888;" colspan="2"></td>
    </tr>
    <tr>
      <td></td>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- order.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(order.onetime.total) %></td>
    </tr>
    <tr>
      <td></td>
      <td align="center" colspan="2">*<%= L.get('ONE_TIME_FEE') %>
      <% if (region == 'DE') { %>
        <br><%= L.get('A_PURCHASE_CONTRACT_GSMB') %>
          <%  }  %>
        </td>
    </tr>
  </tfoot>
  </table>
<% } %>

<% if (showTos) { %>

  <h2 style="margin:0;margin-top: 3em; line-height:1.3; font-weight: 500;text-align:center;"> <%= L.get('TERMS_OF_SERVICE') %>  </h2>
  
  <div style="padding:1em;margin-top:2em;background:#f2f2f2">
    <%= L.get('THANK_YOU_TOS') %> <br />
    <%- order.contact.firstName + ' ' + order.contact.lastName %> <br />
    <%- order.contact.email %> <br />
    <% _.forEach(order.items[0].legalDocuments, function(document) { 
      if (document.pdf) {
    %>
      <a href=<%- (document.pdf) %> ><%- LV(document.title) %></a>
    <% }}) %>
  </div>
  
  <% } %>
`;

module.exports = {
  template,
};
