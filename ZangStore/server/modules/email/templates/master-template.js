const template = (body) =>  {
return `
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=Edge" /><!--<![endif]-->
  
  <!--[if (gte mso 9)|(IE)]>
    <style type="text/css">
    table {border-collapse: collapse;}
    table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
    img {-ms-interpolation-mode: bicubic;}
    </style>
  <![endif]-->

  <title></title>
  <!--[if !mso]><!-- -->
  <link href="https://fonts.googleapis.com/css?family=Montserrat:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">
  <!--<![endif]-->
  <style type="text/css">body, p, div {font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 100%; font-weight: 400; color: #4C4C4C;}
  </style>
  
	<style type="text/css">*{
    -webkit-transition:all .16s ease;
         -moz-transition:all .16s ease;
               -o-transition:all .16s ease;
                     transition:all .16s ease;
  }

  /* HOVER for DESKTOP */
  table[class="wrapper-mobile"] a:hover { box-shadow: 3px 3px 20px #C0BEBE;}
  table#header a img:hover { transform: scale(1.03);}
  table#footer a img:hover { transform: scale(1.3);}

  body {
  color: #4C4C4C;
	margin:0;
	padding:0;	
  }
  body a {
    color: #C00;
    text-decoration: none;
  }
  table[class="wrapper"] {
    width:100% !important;
    table-layout: fixed;
    -webkit-font-smoothing: antialiased;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  img[class="max-width"] {
    max-width: 100% !important;
  }
  
  table[class="wrapper-mobile"] {
      width: 100% !important;
      table-layout: fixed;
  }


  @media screen and (max-width:480px) {
    .preheader .rightColumnContent,
    .footer .rightColumnContent {
        text-align: left !important;
    }
    .preheader .rightColumnContent div,
    .preheader .rightColumnContent span,
    .footer .rightColumnContent div,
    .footer .rightColumnContent span {
      text-align: left !important;
    }
    .preheader .rightColumnContent,
    .preheader .leftColumnContent {
      font-size: 80% !important;
      padding: 5px 0;
    }
    /*
	table[class="wrapper-mobile"] {
      width: 90% !important;
      table-layout: fixed;
    }
	*/
	
	 
    img[class="max-width"] {
      height: auto !important;
    }
    a[class="bulletproof-button"] {
      display: block !important;
      width: auto !important;
      font-size: 100%;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    #templateColumns{
        width:100% !important;
    }

    .templateColumnContainer{
        display:block !important;
        width:100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
    }
  }
	</style>
</head>
<body style="min-width: 100%; margin: 0; padding: 0; font-size: 14px; line-height:1.6; color:#4C4C4C; background-color: #EDEDED;" yahoofix="true">

<center class="wrapper">
<div class="webkit">
<table bgcolor="#FFFFFF" border="0" cellpadding="0" cellspacing="0" class="wrapper" width="100%">
	<tbody>
		<tr>
			<td bgcolor="#EDEDED" valign="top" width="100%"><!--[if (gte mso 9)|(IE)]>
      <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
          <![endif]-->
			<table align="center" border="0" cellpadding="0" cellspacing="0" class="outer" width="100%">
				<tbody>
					<tr>
						<td width="100%">
						<table border="0" cellpadding="0" cellspacing="0" width="100%">
							<tbody>
								<tr>
									<td><!--[if (gte mso 9)|(IE)]>
                      <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <![endif]-->
								<table align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" id="white-bg" style="width: 100%; max-width:600px; padding: 10px 40px 40px 40px;" width="100% ">
										<tbody>
                      <tr>
                        <td align="center" >
                          <img src="https://marketing-image-production.s3.amazonaws.com/uploads/2c8607e85856d229d9cd0f7e8cce342eed2bf328eb7999f0408253297272b8d7f1a47ae14bbbf4b0c9e5ba21597516439edaa8470047c33637e8134c1e952afb.png" style="vertical-align: middle; padding:15px;" />
                        </td>
                      </tr>
											<tr>
												<td align="left" bgcolor="#FFFFFF" role="modules-container" style="padding:0px; text-align: left;" width="100%">
													<table border="0" cellpadding="" cellspacing="0" class="module" data-type="wysiwyg" role="module" style="table-layout: fixed;" width="100%">
														<tbody>
															<tr>
																<td bgcolor="#ffffff" role="module-content" style="padding:0;">

                                  <p>${body}</p>
																	
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
									<!--[if (gte mso 9)|(IE)]>
                          </td>
                        </td>
                      </table>
                    <![endif]--></td>
								</tr>
							</tbody>
						</table>
						</td>
					</tr>
				</tbody>
			</table>
			<!--[if (gte mso 9)|(IE)]>
          </td>
        </tr>
      </table>
      <![endif]--></td>
		</tr>
	</tbody>
</table>
</div>
</center>
</body>
</html>
`};

module.exports = {
    masterTemplate: template,
};