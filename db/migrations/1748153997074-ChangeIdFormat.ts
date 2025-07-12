import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeIdFormat1748153997074 implements MigrationInterface {
    name = 'ChangeIdFormat1748153997074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_0fd78c7eb93885871a197b0a244"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_3924f0efb8df54e51679cfa433a"`);
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "PK_620bff4a240d66c357b5d820eaa"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP COLUMN "videoId"`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD "videoId" integer`);
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "videoId"`);
        await queryRunner.query(`ALTER TABLE "review" ADD "videoId" integer`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_0fd78c7eb93885871a197b0a244" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_3924f0efb8df54e51679cfa433a" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_3924f0efb8df54e51679cfa433a"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_0fd78c7eb93885871a197b0a244"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87"`);
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "videoId"`);
        await queryRunner.query(`ALTER TABLE "review" ADD "videoId" uuid`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP COLUMN "videoId"`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD "videoId" uuid`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "PK_620bff4a240d66c357b5d820eaa"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_3924f0efb8df54e51679cfa433a" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_0fd78c7eb93885871a197b0a244" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
