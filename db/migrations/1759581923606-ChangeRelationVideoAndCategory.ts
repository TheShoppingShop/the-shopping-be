import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeRelationVideoAndCategory1759581923606 implements MigrationInterface {
    name = 'ChangeRelationVideoAndCategory1759581923606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_038baf265a6504529ffb1dcff0f"`);
        await queryRunner.query(`CREATE TABLE "video_categories" ("videoId" integer NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "PK_9ceeba902af3409eaeeae595f2f" PRIMARY KEY ("videoId", "categoryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a8797c3afbf66d4a732ce7eb3f" ON "video_categories" ("videoId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bd03c237ae34966f2586108ec5" ON "video_categories" ("categoryId") `);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "video_categories" ADD CONSTRAINT "FK_a8797c3afbf66d4a732ce7eb3fd" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "video_categories" ADD CONSTRAINT "FK_bd03c237ae34966f2586108ec5c" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video_categories" DROP CONSTRAINT "FK_bd03c237ae34966f2586108ec5c"`);
        await queryRunner.query(`ALTER TABLE "video_categories" DROP CONSTRAINT "FK_a8797c3afbf66d4a732ce7eb3fd"`);
        await queryRunner.query(`ALTER TABLE "video" ADD "categoryId" integer NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd03c237ae34966f2586108ec5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8797c3afbf66d4a732ce7eb3f"`);
        await queryRunner.query(`DROP TABLE "video_categories"`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_038baf265a6504529ffb1dcff0f" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
