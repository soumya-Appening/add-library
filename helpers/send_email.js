const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ email, subject, otp }) => {
  const emailTemplate = `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f9f9f9;"
                id="bodyTable">
                <tbody>
                    <tr>
                        <td style="padding-right: 10px; padding-left: 10px;" align="center" valign="top" id="bodyCell">

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody"
                                style="max-width: 600px; margin: 0 auto;">
                                <tbody>
                                    <tr>
                                        <td align="center" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard"
                                                style="background-color: #fff; border-color: #e5e5e5; border-style: solid; border-width: 0 1px 1px 1px;">
                                                <tbody>
                                                    <tr>
                                                        <td style="background-color: #00d2f4; font-size: 1px; line-height: 3px;"
                                                            class="topBorder" height="3">&nbsp;</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 60px 20px 20px;" align="center" valign="middle"
                                                            class="emailLogo">
                                                            <a href="http://localhost:3000"
                                                                style="text-decoration: none; color: #2A165B; line-height: 100%; font-family: Helvetica, Arial, sans-serif; font-size: 35px; font-weight: bold; margin-bottom: 5px; text-align: center;"
                                                                target="_blank">
                                                                Appening
                                                            </a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 20px;" align="center" valign="top" class="imgHero">
                                                            <a href="#" style="text-decoration: none;" target="_blank">
                                                                <!-- Add your image here if needed -->
                                                            </a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 5px 20px;" align="center" valign="top"
                                                            class="mainTitle">
                                                            <h2 class="text"
                                                                style="color: #000; font-family: Poppins, Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 500; line-height: 36px; text-align: center; margin: 0;">
                                                                Hi Shady!
                                                            </h2>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 20px;" align="center" valign="top"
                                                            class="containtTable ui-sortable">
                                                            <p
                                                                style="color: #000; font-family: Poppins, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; text-align: center; margin: 0;">
                                                                Reset your password
                                                            </p>

                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                class="tableButton">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="padding-top: 20px; padding-bottom: 20px;"
                                                                            align="center" valign="top">
                                                                            <table border="0" cellpadding="0" cellspacing="0"
                                                                                align="center">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="padding-bottom: 20px;"
                                                                                            align="center" class="ctaButton">
                                                                                            <a href="http://localhost:3000"
                                                                                                style="font-family: Poppins, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600; color: #8CC84B; text-decoration: none;"
                                                                                                target="_blank" class="text">
                                                                                                http://localhost:3000
                                                                                            </a>
                                                                                        </td>
                                                                                    </tr>

                                                                                    <tr>
                                                                                        <td style="padding-bottom: 20px;"
                                                                                            align="center" class="ctaButton">
                                                                                            ${otp}
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="font-size: 1px; line-height: 1px;" height="20">&nbsp;</td>
                                                    </tr>

                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-size: 1px; line-height: 1px;" height="30">&nbsp;</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Add Library" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

module.exports = { sendEmail };
