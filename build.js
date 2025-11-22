import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';

// 确保目标目录存在
function ensureDirExists(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

try {
  console.log('🗑️  Cleaning dist folder...');
  try {
    execSync('rimraf dist', { stdio: 'inherit' });
  } catch (e) {
    // 忽略删除失败的错误
  }

  console.log('🏗️  Building client...');
  execSync('pnpm build:client', { stdio: 'inherit' });

  console.log('📁 Copying required files...');
  copyFileSync('package.json', 'dist/package.json');
  copyFileSync('_redirects', 'dist/static/_redirects');
  
  ensureDirExists('dist');
  // 创建 build.flag 文件（跨平台方式）
  writeFileSync('dist/build.flag', '');

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}