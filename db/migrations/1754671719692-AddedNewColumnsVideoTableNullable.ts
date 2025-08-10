import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNewColumnsVideoTableNullable1754671719692 implements MigrationInterface {
    name = 'AddedNewColumnsVideoTableNullable1754671719692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" ADD "metaTitle" character varying`);
        await queryRunner.query(`ALTER TABLE "video" ADD "metaDescription" character varying`);
        await queryRunner.query(`ALTER TABLE "video" ADD "metaKeywords" text array`);
        await queryRunner.query(`ALTER TABLE "video" ADD "videoCode" integer`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "UQ_fe5a6947398ec004d52512b5ff7" UNIQUE ("videoCode")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "UQ_fe5a6947398ec004d52512b5ff7"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "videoCode"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "metaKeywords"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "metaDescription"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "metaTitle"`);
    }

}
