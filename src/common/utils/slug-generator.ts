import slugify from 'slugify';
import { Repository } from 'typeorm';

export async function generateUniqueSlug(
  name: string,
  repo: Repository<any>,
  field: string = 'slug',
): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  while (await repo.findOne({ where: { [field]: slug } })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}
