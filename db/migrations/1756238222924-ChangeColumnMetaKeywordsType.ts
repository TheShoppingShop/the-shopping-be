import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnMetaKeywordsType1756238222924 implements MigrationInterface {
    name = 'ChangeColumnMetaKeywordsType1756238222924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "metaKeywords"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "metaKeywords" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "metaKeywords"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "metaKeywords" text array`);
    }

}
