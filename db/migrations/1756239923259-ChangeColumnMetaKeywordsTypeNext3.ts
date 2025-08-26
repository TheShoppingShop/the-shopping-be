import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnMetaKeywordsTypeNext31756239923259 implements MigrationInterface {
    name = 'ChangeColumnMetaKeywordsTypeNext31756239923259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "metaKeywords"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "metaKeywords" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "metaKeywords"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "metaKeywords" text array`);
    }

}
