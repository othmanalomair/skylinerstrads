-- DropIndex
DROP INDEX IF EXISTS "pokemon_lists_user_id_pokemon_id_list_type_is_shiny_is_shadow_key";

-- AlterTable
ALTER TABLE "pokemon_lists" DROP COLUMN "is_lucky",
DROP COLUMN "is_shadow",
ADD COLUMN "is_dynamax" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_mirror" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_lists_user_id_pokemon_id_list_type_is_shiny_is_mirror_key" ON "pokemon_lists"("user_id", "pokemon_id", "list_type", "is_shiny", "is_mirror");
