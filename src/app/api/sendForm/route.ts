import formData from "form-data";
import Mailgun from "mailgun.js";

export async function POST(req: Request){
  const { name, email, phone, message } = await req.json();
  console.log(name, email, phone, message);
  const date = new Date().toLocaleString();
  console.log(date);
  let mailgun = new Mailgun(formData);
  const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || ''});
  const messageData = {
    from: email,
    to: [process.env.MAILGUN_EMAIL || ''],
    subject: `Message from ${name}`,
    text: `Date: ${date}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
  };
  console.log(messageData);
  let sendStatus: boolean = false;
  await mg.messages.create(process.env.MAILGUN_DOMAIN || '', messageData)
    .then(() => {
      console.log('Message sent successfully');
      return sendStatus = true;
    }
  ).catch((err) => {
    console.error(err);
    return sendStatus = false;
  });
  if (sendStatus) {
    return Response.json({status: 'Message sent successfully'}, {status: 200})
  }
  else {
    return Response.json({status: 'Message failed to send'}, {status: 500})
  }
}