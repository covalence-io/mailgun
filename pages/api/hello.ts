// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import MailGen from 'mailgen';

const API_KEY = process.env.MAILGUN_KEY || '[YOUR API KEY]';
const DOMAIN = process.env.MAILGUN_DOMAIN || '[YOUR DOMAIN]';

const mailgen = new MailGen({
    theme: 'default',
    product: {
        name: 'Covalence',
        link: 'https://covalence.io',
    },
});

const mailgun = new Mailgun(FormData).client({
    username: 'api',
    key: API_KEY,
});

type Data = {
    success: boolean;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === 'POST') {
        const body = req.body || {};
        const intro = body.intro || '';
        const content = body.content || '';
        const email = {
            body: {
                name: body.name || 'Customer',
                intro,
                outro: content,
            },
        };

        try {
            // Mailgun send
            await mailgun.messages.create(DOMAIN, {
                to: body.to,
                from: 'Covalence <no-reply@covalence.io>',
                subject: body.subject || 'Email',
                text: mailgen.generatePlaintext(email),
                html: mailgen.generate(email),
            });

            res.status(200).json({ success: true });
        } catch(e) {
            res.status(500).json({ success: false });
        }

        return;
    }

    res.status(404).json({ success: false });
}
