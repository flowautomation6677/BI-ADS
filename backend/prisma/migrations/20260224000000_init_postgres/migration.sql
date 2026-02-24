-- CreateTable
CREATE TABLE "Relatorio" (
    "id" TEXT NOT NULL,
    "id_unico" TEXT NOT NULL,
    "ad_account_id_facebook" TEXT NOT NULL,
    "nome_cliente" TEXT NOT NULL,
    "kpi_principal" TEXT NOT NULL DEFAULT 'ROAS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Relatorio_id_unico_key" ON "Relatorio"("id_unico");
