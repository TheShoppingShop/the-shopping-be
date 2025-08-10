import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewCountAndLikeColumns1752669028005 implements MigrationInterface {
    name = 'AddNewCountAndLikeColumns1752669028005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" ADD "views" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "video" ADD "likes" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "likes"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "views"`);
    }

}
