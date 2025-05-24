// 🧪 桌面游戏助手 - 端到端自动化测试
// 使用Puppeteer模拟真实用户操作，测试完整流程

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: {
    width: 1280,
    height: 720
  },
  headless: false, // 显示浏览器界面，便于观察测试过程
  slowMo: 100, // 减慢操作速度，便于观察
};

// 测试用例
const TEST_CASES = [
  {
    name: '主页加载测试',
    description: '验证主页正确加载，所有核心元素可见',
    test: testHomePage
  },
  {
    name: '玩家设置流程',
    description: '测试完整的玩家设置流程',
    test: testPlayerSetup
  },
  {
    name: 'AI设置配置',
    description: '测试AI助手配置功能',
    test: testAISettings
  },
  {
    name: '模板管理功能',
    description: '测试模板浏览、选择和管理',
    test: testTemplateManagement
  },
  {
    name: '房间创建流程',
    description: '测试创建游戏房间的完整流程',
    test: testRoomCreation
  },
  {
    name: '游戏启动流程',
    description: '测试完整的游戏启动和进行流程',
    test: testGameFlow
  },
  {
    name: '响应式设计测试',
    description: '测试不同屏幕尺寸的适配性',
    test: testResponsiveDesign
  }
];

// 主测试函数
async function runFullTest() {
  console.log('🚀 开始桌面游戏助手全面测试...\n');
  
  const browser = await puppeteer.launch({
    headless: TEST_CONFIG.headless,
    slowMo: TEST_CONFIG.slowMo,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: TEST_CONFIG.viewport
  });

  const results = [];
  let totalTests = 0;
  let passedTests = 0;

  try {
    for (const testCase of TEST_CASES) {
      console.log(`\n📋 执行测试: ${testCase.name}`);
      console.log(`   描述: ${testCase.description}`);
      
      const page = await browser.newPage();
      await page.setViewport(TEST_CONFIG.viewport);
      
      try {
        const startTime = Date.now();
        await testCase.test(page);
        const duration = Date.now() - startTime;
        
        console.log(`   ✅ 通过 (${duration}ms)`);
        results.push({ name: testCase.name, status: 'PASS', duration });
        passedTests++;
      } catch (error) {
        console.log(`   ❌ 失败: ${error.message}`);
        results.push({ name: testCase.name, status: 'FAIL', error: error.message });
        
        // 保存失败截图
        await page.screenshot({
          path: `tests/screenshots/failed-${testCase.name.replace(/\s+/g, '-')}.png`,
          fullPage: true
        });
      } finally {
        await page.close();
        totalTests++;
      }
    }
  } finally {
    await browser.close();
  }

  // 生成测试报告
  generateTestReport(results, totalTests, passedTests);
}

// 主页加载测试
async function testHomePage(page) {
  await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
  
  // 验证页面标题
  const title = await page.title();
  if (!title.includes('桌游') && !title.includes('Game')) {
    throw new Error('页面标题不正确');
  }
  
  // 验证关键元素存在
  await page.waitForSelector('.home-page', { timeout: 5000 });
  await page.waitForSelector('.page-title', { timeout: 5000 });
  await page.waitForSelector('.action-cards', { timeout: 5000 });
  
  // 验证操作卡片
  const actionCards = await page.$$('.action-card');
  if (actionCards.length < 3) {
    throw new Error('主页操作卡片数量不足');
  }
  
  // 验证功能介绍区域
  await page.waitForSelector('.features-section', { timeout: 5000 });
  
  console.log('     🔍 主页所有关键元素验证通过');
}

// 玩家设置流程测试
async function testPlayerSetup(page) {
  await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
  
  // 点击玩家设置
  await page.waitForSelector('.action-card--accent', { timeout: 5000 });
  await page.click('.action-card--accent');
  
  // 等待玩家设置页面加载
  await page.waitForSelector('.player-setup-page', { timeout: 5000 });
  
  // 填写玩家名称
  await page.waitForSelector('#playerName', { timeout: 5000 });
  await page.type('#playerName', '测试玩家', { delay: 50 });
  
  // 选择头像
  await page.waitForSelector('.avatar-option', { timeout: 5000 });
  await page.click('.avatar-option:nth-child(3)');
  
  // 选择游戏偏好
  await page.click('input[value="card"]');
  await page.click('input[value="intermediate"]');
  await page.click('input[value="competitive"]');
  
  // 验证预览
  const previewName = await page.$eval('.preview-name', el => el.textContent);
  if (!previewName.includes('测试玩家')) {
    throw new Error('玩家名称预览不正确');
  }
  
  // 完成设置
  await page.click('.continue-button');
  
  // 验证返回主页
  await page.waitForSelector('.home-page', { timeout: 5000 });
  
  console.log('     🎮 玩家设置流程完成');
}

// AI设置测试
async function testAISettings(page) {
  await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
  
  // 点击AI设置卡片
  await page.waitForSelector('.action-card--ai', { timeout: 5000 });
  await page.click('.action-card--ai');
  
  // 等待AI设置页面加载
  await page.waitForSelector('.ai-settings-page', { timeout: 5000 });
  
  // 验证AI提供商选择
  await page.waitForSelector('.providers-grid', { timeout: 5000 });
  const providerCards = await page.$$('.provider-card');
  if (providerCards.length < 4) {
    throw new Error('AI提供商选项不足');
  }
  
  // 选择OpenAI提供商
  await page.click('.provider-card:nth-child(2)');
  
  // 验证配置表单显示
  await page.waitForSelector('.config-section', { timeout: 5000 });
  
  // 填写API密钥
  await page.type('input[type="password"]', 'sk-test123456789', { delay: 30 });
  
  // 调整温度参数
  await page.evaluate(() => {
    const slider = document.querySelector('.form-range');
    if (slider) {
      slider.value = '0.8';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  // 保存设置
  await page.click('button:contains("保存设置")');
  
  console.log('     🤖 AI设置配置完成');
}

// 模板管理测试
async function testTemplateManagement(page) {
  await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
  
  // 点击模板管理
  await page.click('.action-card--secondary');
  
  // 等待模板管理页面加载
  await page.waitForSelector('.template-manage-page', { timeout: 5000 });
  
  // 验证标签页
  await page.waitForSelector('.section-tabs', { timeout: 5000 });
  
  // 检查内置模板
  const builtinTab = await page.$('.tab-button:first-child');
  if (builtinTab) {
    await builtinTab.click();
    await page.waitForSelector('.template-card.builtin', { timeout: 5000 });
    
    const builtinTemplates = await page.$$('.template-card.builtin');
    if (builtinTemplates.length < 3) {
      throw new Error('内置模板数量不足');
    }
  }
  
  // 点击模板查看详情
  await page.click('.template-card:first-child');
  await page.waitForSelector('.template-details', { timeout: 5000 });
  
  // 复制模板到用户模板
  await page.click('.action-btn.duplicate');
  
  // 切换到用户模板标签
  await page.click('.tab-button:last-child');
  await page.waitForSelector('.template-card.user', { timeout: 5000 });
  
  console.log('     📦 模板管理功能验证通过');
}

// 房间创建测试
async function testRoomCreation(page) {
  await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
  
  // 点击开始游戏
  await page.click('.action-card--primary');
  
  // 等待游戏启动页面
  await page.waitForSelector('.game-start-page', { timeout: 5000 });
  
  // 创建房间
  await page.click('button:contains("创建房间")');
  
  // 填写房间信息
  await page.type('input[placeholder*="房间名"]', '测试房间', { delay: 50 });
  
  // 设置玩家数量
  await page.select('select', '4');
  
  // 确认创建
  await page.click('button:contains("创建")');
  
  // 等待进入房间
  await page.waitForSelector('.game-room-page', { timeout: 10000 });
  
  // 验证房间信息
  const roomName = await page.$eval('.room-name', el => el.textContent);
  if (!roomName.includes('测试房间')) {
    throw new Error('房间名称不正确');
  }
  
  console.log('     🏠 房间创建流程完成');
}

// 游戏流程测试
async function testGameFlow(page) {
  await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
  
  // 进入演示模式
  await page.click('.action-card--primary');
  await page.waitForSelector('.game-start-page', { timeout: 5000 });
  await page.click('button:contains("演示模式")');
  
  // 等待进入游戏房间
  await page.waitForSelector('.game-room-page', { timeout: 10000 });
  
  // 选择游戏模板
  await page.waitForSelector('.template-card', { timeout: 5000 });
  await page.click('.template-card:first-child');
  
  // 开始游戏
  await page.click('.start-game-btn');
  
  // 验证游戏界面加载
  await page.waitForSelector('.game-interface', { timeout: 10000 });
  
  // 测试AI助手
  const aiButton = await page.$('.ai-assistant-btn');
  if (aiButton) {
    await aiButton.click();
    await page.waitForSelector('.ai-chat-panel', { timeout: 5000 });
  }
  
  console.log('     🎯 游戏流程测试完成');
}

// 响应式设计测试
async function testResponsiveDesign(page) {
  await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
  
  const viewports = [
    { width: 320, height: 568, name: '手机' },
    { width: 768, height: 1024, name: '平板' },
    { width: 1920, height: 1080, name: '桌面' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewport(viewport);
    await page.waitForTimeout(1000);
    
    // 验证关键元素仍然可见
    await page.waitForSelector('.home-page', { timeout: 5000 });
    await page.waitForSelector('.action-cards', { timeout: 5000 });
    
    // 检查布局是否正确
    const actionCards = await page.$$('.action-card');
    if (actionCards.length === 0) {
      throw new Error(`${viewport.name}视图下操作卡片不可见`);
    }
    
    console.log(`     📱 ${viewport.name}视图 (${viewport.width}x${viewport.height}) 验证通过`);
  }
}

// 生成测试报告
function generateTestReport(results, totalTests, passedTests) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过数: ${passedTests}`);
  console.log(`失败数: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${status} ${result.name}${duration}`);
    if (result.error) {
      console.log(`    错误: ${result.error}`);
    }
  });
  
  console.log('='.repeat(60));
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！项目已经可以投入使用。');
  } else {
    console.log('⚠️  部分测试失败，请检查问题并修复。');
  }
  
  // 生成详细报告文件
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(2)
    },
    results
  };
  
  const reportPath = 'tests/reports/test-report.json';
  
  // 确保目录存在
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`📄 详细报告已保存到: ${reportPath}`);
}

// 工具函数：等待元素包含文本
async function waitForTextContent(page, selector, text, timeout = 5000) {
  await page.waitForFunction(
    (selector, text) => {
      const element = document.querySelector(selector);
      return element && element.textContent.includes(text);
    },
    { timeout },
    selector,
    text
  );
}

// 启动测试
runFullTest().catch(console.error);

export {
  runFullTest,
  testHomePage,
  testPlayerSetup,
  testAISettings,
  testTemplateManagement,
  testRoomCreation,
  testGameFlow,
  testResponsiveDesign
}; 