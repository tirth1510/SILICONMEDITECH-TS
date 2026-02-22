import Contact, { IContact } from '../models/contact.model';
import dbConnect from '../lib/db';
import { sendEmail } from '../lib/mailer';
import { v4 as uuidv4 } from 'uuid';

const COMPANY_LOGO_URL = "https://res.cloudinary.com/dq4hevka1/image/upload/v1766235630/products/product-images/gbhs2ft4m5fqvwue0kol.png";

interface CreateContactData {
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    companyEmail?: string;
    companyLocation?: string;
    companyPhoneNumber?: string;
    messageTitle?: string;
    message: string;
}

export const createContactService = async (data: CreateContactData): Promise<IContact> => {
    await dbConnect();

    const contactId = uuidv4();
    const formattedUserPhone = data.phone.replace(/\D/g, "");

    const newContact = await Contact.create({
        contactId,
        ...data,
        phone: formattedUserPhone,
        enquiryType: 'Enquiry',
    });

    const emailHeader = `<img src="${COMPANY_LOGO_URL}" alt="Silicon Meditech" style="width: 180px; height: auto; display: block; margin: 0 auto;"/>`;
    const websiteFooter = `
      <div style="background-color: #f8fafc; color: #64748b; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Visit us at <a href="https://www.siliconmeditech.in" style="color: #043bbc; text-decoration: none; font-weight: 600;">www.siliconmeditech.in</a></p>
      </div>`;

    const adminEmailPromise = sendEmail({
      to: process.env.SMTP_USER!,
      subject: `New Inquiry from ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #ffffff; padding: 25px 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              ${emailHeader}
            </div>
            <div style="padding: 30px; color: #475569; line-height: 1.6;">
              <h2 style="margin-top: 12px; margin-bottom: 25px; font-size: 22px; font-weight: 600; text-align: center; color: #043bbc;">New General Inquiry</h2>
              <p style="margin: 8px 0;">🏷️ <strong>Contact ID:</strong> <span style="color: #0f172a;">${contactId}</span></p>
              <p style="margin: 8px 0;">👤 <strong>Name:</strong> <span style="color: #0f172a;">${data.name}</span></p>
              <p style="margin: 8px 0;">✉️ <strong>Email:</strong> <a href="mailto:${data.email}" style="color: #043bbc; text-decoration: none;">${data.email}</a></p>
              <p style="margin: 8px 0;">📞 <strong>Phone:</strong> <a href="tel:${data.phone}" style="color: #043bbc; text-decoration: none;">${data.phone}</a></p>
              <p style="margin: 8px 0;">🏢 <strong>Company:</strong> <span style="color: #0f172a;">${data.companyName || "N/A"}</span></p>
              <p style="margin: 8px 0;">📍 <strong>Location:</strong> <span style="color: #0f172a;">${data.companyLocation || "N/A"}</span></p>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-top: 25px; border: 1px solid #e2e8f0; border-left: 4px solid #043bbc;">
                <p style="margin: 0; color: #0f172a;">💬 <strong>Message:</strong><br/><br/>${data.message.replace(/\n/g, '<br/>')}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    const userEmailPromise = sendEmail({
      to: data.email,
      subject: "We received your message",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #ffffff; padding: 25px 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              ${emailHeader}
            </div>
            <div style="padding: 30px; color: #475569; line-height: 1.6;">
              <h2 style="margin-top: 12px; margin-bottom: 22px; font-size: 22px; text-align: center; font-weight: 600; color: #043bbc;">Message Received</h2>
              <p style="font-size: 16px; color: #0f172a;">Hello <strong>${data.name}</strong>,</p>
              <p>Thank you for contacting us. We have successfully received your inquiry and our team will get back to you shortly.</p>
              <p style="margin-bottom: 0; margin-top: 30px; color: #0f172a;">Best regards,<br/><strong>Silicon Meditech Team</strong></p>
            </div>
            ${websiteFooter}
          </div>
        </body>
        </html>
      `,
    });

    await Promise.all([adminEmailPromise, userEmailPromise]);

    return newContact;
};

export const getAllContactsService = async (): Promise<IContact[]> => {
    await dbConnect();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return contacts;
};
