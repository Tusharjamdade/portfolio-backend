-- CreateTable
CREATE TABLE "Comments" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contactme" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Contactme_pkey" PRIMARY KEY ("id")
);
