import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748153828135 implements MigrationInterface {
    name = 'Init1748153828135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "videoUrl"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "thumbnailUrl"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "videoFilename" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "video" ADD "thumbnailFilename" character varying`);
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_038baf265a6504529ffb1dcff0f"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "categoryId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_038baf265a6504529ffb1dcff0f" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_038baf265a6504529ffb1dcff0f"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "categoryId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_038baf265a6504529ffb1dcff0f" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "thumbnailFilename"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "videoFilename"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "thumbnailUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "video" ADD "videoUrl" character varying NOT NULL`);
    }

}
