import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IContact extends Document {
    contactId: string;
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    companyEmail?: string;
    companyPhoneNumber?: string;
    companyLocation?: string;
    messageTitle?: string;
    message: string;
    enquiryType: 'Enquiry' | 'Product' | 'Accessory';
    productTitle?: string;
    modelName?: string;
    productImageUrl?: string;
    productId?: string;
    modelId?: string;
}

const ContactSchema: Schema<IContact> = new Schema(
    {
        contactId: { type: String, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        companyName: String,
        companyEmail: String,
        companyPhoneNumber: String,
        companyLocation: String,
        messageTitle: String,
        message: { type: String, required: true },
        enquiryType: { type: String, default: 'Enquiry' },
        productTitle: String,
        modelName: String,
        productImageUrl: String,
        productId: String,
        modelId: String,
    },
    { timestamps: true }
);

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
