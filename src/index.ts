import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono';
import { commentZod, contactmeZod } from './zod';
import { cors } from 'hono/cors';
// import * as multipart from 'multipart'; // Importing multipart for file uploads
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { env } from 'hono/adapter';
import { env, getRuntimeKey } from 'hono/adapter'
// import { json } from 'hono';


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    GOOGLE_KEY:string
  },
}>();

app.use('/*', cors());

// Comment endpoint
app.post('/comment', async (c) => {
  const body = commentZod.safeParse(await c.req.json());
  console.log(body);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  
  const currentDate = dd + '/' + mm + '/' + yyyy;
  if (!body.success) {
    return c.json({ msg: "Invalid Inputs" });
  }

  try {
    const resp = await prisma.comments.create({
      data: {
        name:body.data.name,
        comment:body.data.comment,
        postTime:currentDate
      },
    });
    console.log(resp);
    return c.json({ resp });
  } catch (error) {
    return c.json({ msg: "Failed" });
  }
});

// Contactme endpoint
app.post('/contactme', async (c) => {
  const body = contactmeZod.safeParse(await c.req.json());
  console.log(body);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  if (!body.success) {
    return c.json({ msg: "Invalid Inputs" });
  }

  try {
    const resp = await prisma.contactme.create({
      data: body.data,
    });
    console.log(resp);
    return c.json({ resp });
  } catch (error) {
    return c.json({ msg: "Failed" });
  }
});

// PDF upload endpoint
app.post('/uploadpdf', async (c) => {
  const form = await c.req.formData();
  const file = form.get('pdf');

  if (!file || !(file instanceof File)) {
    return c.json({ msg: 'No file uploaded or invalid file type' }, 400);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const resp = await prisma.pdfDocument.create({
      data: {
        name: file.name,
        data: new Uint8Array(await file.arrayBuffer()), // Convert file to Uint8Array
      },
    });
    console.log(resp);
    return c.json({ resp });
  } catch (error) {
    return c.json({ msg: 'Failed to upload PDF' }, 500);
  }
});

// PDF download endpoint
// PDF download endpoint
// PDF download endpoint
app.get('/downloadpdf/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ msg: 'Invalid ID' }, 400);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const pdfDocument = await prisma.pdfDocument.findUnique({
      where: { id },
    });

    if (!pdfDocument) {
      return c.json({ msg: 'PDF not found' }, 404);
    }

    // Directly use Uint8Array for the response
    const data = new Uint8Array(pdfDocument.data);

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfDocument.name}"`,
      },
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    return c.json({ msg: 'Failed to retrieve PDF' }, 500);
  }
});

app.get("/comments",async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const comments = await prisma.comments.findMany({});
    return c.json(comments)
  } catch (error) {
    return c.json({msg:"Error Occured"})
  }
})



app.post('/api', async (c) => {
  try {
    // Parse the JSON body from the request
    const body = await c.req.json();
    // const generationConfig = {
    //   stopSequences: ["red"],
    //   maxOutPutTokens: 50,
    //   temperature: 0.9,
    //   topP: 0.1,
    //   topK: 16
    // };

    // Access the environment variable
    const googleKey = c.env.GOOGLE_KEY;

    if (!googleKey) {
      throw new Error('GOOGLE_KEY environment variable is not set.');
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the prompt and generate content
    const prompt = "reply in 2 lines, " + body.search;
    const result = await model.generateContent(prompt,);
    const text = result.response.text();

    // Return the response as JSON
    return c.json({ text });
  } catch (error) {
    console.error("Error generating content:", error);
    return c.json({ error: "Failed to generate content" }, { status: 500 });
  }
});
export default app;
