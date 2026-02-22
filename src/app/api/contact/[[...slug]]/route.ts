import { NextRequest, NextResponse } from 'next/server';
import { 
    createContactService, 
    getAllContactsService,
    createProductEnquiryService,
    createAccessoryEnquiryService,
    respondToEnquiryService,
    getAllProductEnquiriesService,
    getAllAccessoryEnquiriesService 
} from '../../../../services/contact.service';

export async function GET(req: NextRequest) {
    const { pathname } = new URL(req.url);

    if (pathname === '/api/contact/all') {
        try {
            const contacts = await getAllContactsService();
            return NextResponse.json({
                success: true,
                count: contacts.length,
                data: contacts,
            }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    if (pathname === '/api/contact/products') {
        try {
            const contacts = await getAllProductEnquiriesService();
            return NextResponse.json({
                success: true,
                count: contacts.length,
                data: contacts,
            }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    if (pathname === '/api/contact/accessories') {
        try {
            const contacts = await getAllAccessoryEnquiriesService();
            return NextResponse.json({
                success: true,
                count: contacts.length,
                data: contacts,
            }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'GET request received' });
}

export async function POST(req: NextRequest) {
    const { pathname } = new URL(req.url);

    if (pathname === '/api/contact/create') {
        try {
            const body = await req.json();
            const { name, email, phone, message } = body;

            if (!name || !email || !phone || !message) {
                return NextResponse.json({ success: false, error: "Name, email, phone, and message are required" }, { status: 400 });
            }

            const newContact = await createContactService(body);

            return NextResponse.json({ success: true, message: "Contact saved and notifications sent via Email", data: newContact }, { status: 201 });
        } catch (error: any) {
            console.error("CONTACT ERROR:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    if (pathname === '/api/contact/product-enquiry') {
        try {
            const body = await req.json();
            const { name, email, phone, message, productTitle, modelName, productImageUrl, productId, modelId } = body;

            if (!name || !email || !phone || !message || !productTitle || !modelName || !productImageUrl || !productId || !modelId) {
                return NextResponse.json({ success: false, error: "All fields are required for product enquiry" }, { status: 400 });
            }

            const newEnquiry = await createProductEnquiryService(body);

            return NextResponse.json({ success: true, message: "Product enquiry saved and notifications sent via Email", data: newEnquiry }, { status: 201 });
        } catch (error: any) {
            console.error("PRODUCT ENQUIRY ERROR:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    if (pathname === '/api/contact/accessory-enquiry') {
        try {
            const body = await req.json();
            const { name, email, phone, message, productTitle, productImageUrl, productId } = body;

            if (!name || !email || !phone || !message || !productTitle || !productImageUrl || !productId) {
                return NextResponse.json({ success: false, error: "All fields are required for accessory enquiry" }, { status: 400 });
            }

            const newEnquiry = await createAccessoryEnquiryService(body);

            return NextResponse.json({ success: true, message: "Accessory enquiry saved and notifications sent via Email", data: newEnquiry }, { status: 201 });
        } catch (error: any) {
            console.error("ACCESSORY ENQUIRY ERROR:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    if (pathname === '/api/contact/respond') {
        try {
            const body = await req.json();
            const { contactId, responseMessage } = body;

            if (!contactId || !responseMessage) {
                return NextResponse.json({ success: false, error: "Contact ID and response message are required" }, { status: 400 });
            }

            await respondToEnquiryService(body);

            return NextResponse.json({ success: true, message: "Response sent successfully" }, { status: 200 });
        } catch (error: any) {
            console.error("RESPOND TO ENQUIRY ERROR:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'POST request received' });
}
