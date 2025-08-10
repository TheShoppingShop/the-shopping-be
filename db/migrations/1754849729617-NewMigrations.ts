import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1754849729617 implements MigrationInterface {
    name = 'NewMigrations1754849729617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "emailVerified" boolean NOT NULL DEFAULT false, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "imgUrl" character varying, "slug" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "video" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "videoFilename" character varying NOT NULL, "thumbnailFilename" character varying, "amazonLink" character varying, "views" integer NOT NULL DEFAULT '0', "metaTitle" character varying, "metaDescription" character varying, "metaKeywords" text array, "likes" integer NOT NULL DEFAULT '0', "videoCode" integer, "tags" text array NOT NULL DEFAULT '{}', "categoryId" integer NOT NULL, "isPublished" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_11c248abdf3cf9cdafabccab429" UNIQUE ("slug"), CONSTRAINT "UQ_fe5a6947398ec004d52512b5ff7" UNIQUE ("videoCode"), CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wishlist" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "videoId" integer, CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "summary" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "videoId" integer, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_038baf265a6504529ffb1dcff0f" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_0fd78c7eb93885871a197b0a244" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_3924f0efb8df54e51679cfa433a" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_3924f0efb8df54e51679cfa433a"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_0fd78c7eb93885871a197b0a244"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87"`);
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_038baf265a6504529ffb1dcff0f"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`DROP TABLE "wishlist"`);
        await queryRunner.query(`DROP TABLE "video"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
