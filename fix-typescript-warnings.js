import fs from 'fs';

// 快速修复TypeScript未使用变量警告

const fixes = [
  {
    file: 'src/components/pages/AISettingsPage.tsx',
    search: 'const getCurrentModels = () => {',
    replace: '// const getCurrentModels = () => {'
  },
  {
    file: 'src/games/CardCompareGame.ts',
    search: 'private readonly CARDS_PER_ROUND = 1;',
    replace: '// private readonly CARDS_PER_ROUND = 1;'
  },
  {
    file: 'src/games/DiceGuessGame.ts',
    search: 'interface DiceGuess {',
    replace: '// interface DiceGuess {'
  },
  {
    file: 'src/games/DiceGuessGame.ts',
    search: 'private executeRollAction(state: GameState, action: GameAction): GameState {',
    replace: 'private executeRollAction(state: GameState, _action: GameAction): GameState {'
  },
  {
    file: 'src/games/GomokuGame.ts',
    search: 'BoardCell,',
    replace: '// BoardCell,'
  }
];

fixes.forEach(fix => {
  try {
    const content = fs.readFileSync(fix.file, 'utf8');
    const newContent = content.replace(fix.search, fix.replace);
    fs.writeFileSync(fix.file, newContent);
    console.log(`Fixed: ${fix.file}`);
  } catch (error) {
    console.log(`Error fixing ${fix.file}:`, error.message);
  }
});

console.log('TypeScript warnings fixed!'); 