const template = `

<h4 style='font-weight:300;'>
  Name: <b><%- user.firstName %> <%- user.lastName %></b><br />
  Email: <b><%- user.username %></b>
</h4>

<table style='width:100%;border-collapse:collapse;'>
  <thead>
    <tr style="border-bottom:1px solid #888888;">
      <th>Title</th>
      <th align="right"><%= L.get('ONE_TIME_FEE') %></th>
      <th align="right"><%= L.get('ACCORDING_TO_PLAN') %></th>
    </tr>
  </thead>
  <tbody>
<% _.forEach(order.items, function(item) { %>
    <tr>
      <td>
        <%- LV(item.title) %>
        <% if (item.price) { %>@ <%- currency(item.price) %><% } %>
        <% if (item.quantity && item.quantity > 1) { %>x <%- item.quantity %><% } %>
        <% if (item.additionalInformation && item.additionalInformation.text) { %>: <%- item.additionalInformation.text %><% } %>
      </td>
      <td align="right"><%- (item.isOneTimeCharge ? currency((item.price || 0) * item.quantity) : '') %></td>
      <td align="right"><%- (!item.isOneTimeCharge ? currency((item.price || 0) * item.quantity) : '') %></td>
    </tr>
<% }) %>
  </tbody>
  <tfoot>
    <tr style="border-top:1px solid #888888;">
      <td><%= L.get('SUB_TOTAL') %></td>
      <td align="right"><%- currency(order.onetime.subTotal) %></td>
      <td align="right"><%- (order.subscriptions && order.subscriptions && order.subscriptions[0] && currency(order.subscriptions[0].subTotal)) || '' %></td>
    </tr>
    <tr>
      <td><%= L.get('TAXES') %></td>
      <td align="right"><%- currency(order.onetime.tax) %></td>
      <td align="right"><%- (order.subscriptions && order.subscriptions && order.subscriptions[0] && currency(order.subscriptions[0].tax)) || '' %></td>
    </tr>
    <tr>
      <td><%= L.get('FREE_SHIPPING') %></td>
      <td align="right"><%- currency(order.onetime.shipping) %></td>
      <td align="right"><%- (order.subscriptions && order.subscriptions && order.subscriptions[0] && currency(order.subscriptions[0].shipping)) || '' %></td>
    </tr>
    <tr>
      <td style="font-weight:bold;"><%= L.get('TOTAL') %> (<%- order.currency %>)</td>
      <td style="text-align:right;font-weight:bold;"><%- currency(order.onetime.total) %></td>
      <td style="text-align:right;font-weight:bold;"><%- (order.subscriptions && order.subscriptions && order.subscriptions[0] && currency(order.subscriptions[0].total)) || '' %></td>
    </tr>
  </tfoot>
</table>

`;

module.exports = {
  template,
};
