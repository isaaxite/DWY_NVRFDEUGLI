import { execa }  from 'execa';
import fse from 'fs-extra';
import mustache from 'mustache';
import { execSync } from 'child_process';
import path from 'path';

async function main() {
  fse.ensureDirSync('./dist');
  try {
    fse.statSync('dist/temp');
    fse.mkdirSync('dist/temp');
  } catch (error) {}
  
  try {
    fse.copySync('./src', './dist/temp');
  } catch (error) {
    console.error(error);
  }
  const { stdout: lastModifyTime } = await execa('date -u +"%Y-%m-%dT%H:%M:%SZ"', { shell: true });
 
  const packageDoc = mustache.render(
    fse.readFileSync('src/OEBPS/content.opf', 'utf8'),
    { lastModifyTime }
  );

  fse.writeFileSync('dist/temp/OEBPS/content.opf', packageDoc);

  try {
    fse.statSync('dist/nvrfdeugli.epub');
    fse.rmSync('dist/nvrfdeugli.epub');
  } catch (error) {}

  const tempCWD = path.join(process.cwd(), 'dist/temp');
  execSync(`zip -X ../nvrfdeugli.epub mimetype`, { cwd: tempCWD });
  execSync(`zip -rg ../nvrfdeugli.epub META-INF OEBPS`, { cwd: tempCWD });
  fse.rmSync(tempCWD, { recursive: true });
}

main();
