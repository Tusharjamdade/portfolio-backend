import zod, { string }  from "zod";

export const commentZod = zod.object({
    name:zod.string(),
    comment:zod.string()
})

export const contactmeZod = zod.object({
    email:zod.string().email(),
    subject:zod.string(),
    message:zod.string()
})

