import { NextRequest, NextResponse } from 'next/server';
import { createContactService, getAllContactsService } from '../../../../services/contact.service';

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

    return NextResponse.json({ message: 'POST request received' });
}
