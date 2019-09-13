const template = `
<h2 style="margin:0; line-height:1.3; font-weight: 500;text-align:center;">
  Order failed to complete provisioning process <%- confirmationNumber %>
</h2>

<p><hr /></p>

<p>
Please navigate <a href="<%= planUrl %>">here</a> as a site administrator to retry the provisioning process.
</p>
`;

module.exports = {
  template,
};
