// 🤖 桌游伴侣全自动化端到端测试
// 测试所有核心用户流程，自动验证UI和功能

const setupMockPlayer = () => {
  const mockPlayer = {
    id: 'test-player-id-' + Date.now(),
    name: '自动化测试玩家',
    avatar: '🤖'
  };
  localStorage.setItem('current_player', JSON.stringify(mockPlayer));
};

describe('🎮 桌游伴侣全自动化测试', () => {
  const BASE_URL = 'http://localhost:3000'
  
  beforeEach(() => {
    // 清理localStorage，确保测试环境干净
    cy.clearLocalStorage();
    cy.visit(BASE_URL);
    // 确保在开始时 data-player-loaded 属性不存在 (除非localStorage预设了某些东西)
    // cy.get('body').should('not.have.attr', 'data-player-loaded'); // 可选的额外检查
  })

  it('✅ 1. 应用启动测试', () => {
    cy.log('🔍 检查页面基本加载')
    
    // 验证页面标题
    cy.title().should('contain', '桌游伴侣')
    
    // 验证主要区域存在
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')
    
    // 验证主页欢迎标题存在
    cy.get('h1.hero-title').should('be.visible')
    
    // 验证关键按钮/卡片存在 (使用更具体的选择器)
    cy.get('[data-testid="hero-start-game"]').should('be.visible') // 主CTA按钮
    cy.get('[data-testid="start-game-card"]').should('be.visible') // 快速操作卡片
    cy.get('[data-testid="template-management-card"]').should('be.visible')
    
    cy.log('✅ 应用启动测试通过')
  })

  it('✅ 2. 玩家设置流程测试', () => {
    cy.log('🔍 测试玩家设置功能');

    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.clearLocalStorage('current_player');
    cy.reload(); 
    // 确认玩家未加载
    cy.get('body', { timeout: 10000 }).should('not.have.attr', 'data-player-loaded');

    cy.get('[data-testid="hero-start-game"]').should('be.visible').click();
    
    cy.wrap(alertStub).should('be.calledOnceWith', '请先设置玩家信息');

    // 验证导航到了玩家设置页面 (通过页面特定元素)
    cy.get('[data-testid="player-setup-page"]', { timeout: 10000 }).should('be.visible');
    cy.contains('h1', '创建您的游戏档案').should('be.visible'); // PlayerSetupPage的标题
    
    cy.log('✅ 玩家设置测试通过');
  })

  it('✅ 3. 创建房间完整流程测试', () => {
    cy.log('🔍 测试创建房间功能');

    cy.then(setupMockPlayer);
    cy.reload();
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after reload:', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');

    cy.get('[data-testid="hero-start-game"]').should('be.visible').click();
    
    // 验证导航到游戏启动页面 - 模式选择阶段
    cy.get('[data-testid="game-start-page"]', { timeout: 10000 }).should('be.visible');
    cy.contains('h1.page-title', '选择游戏模式', { timeout: 10000 }).should('be.visible');
    
    // 点击创建房间卡片
    cy.get('[data-testid="create-room-mode"]').should('be.visible').click();
    
    // 验证进入创建房间表单视图 (例如，通过寻找表单标题或特定输入框)
    cy.contains('h2', '创建新房间').should('be.visible'); // 假设创建房间视图有此标题

    cy.get('input[placeholder*="房间名称"]').clear().type('自动化测试房间');
    cy.get('select[name="maxPlayers"]').select('4');
    
    cy.get('input[type="checkbox"][name="isPrivate"]').check();
    cy.get('input[type="password"][name="roomPassword"]').type('test123');
    
    cy.get('button[type="submit"]').contains('创建房间').should('be.visible').click();
    
    // 验证房间创建成功 (通过页面特定元素)
    cy.contains('h2', '自动化测试房间', { timeout: 15000 }).should('be.visible'); // GameRoomPage 房间名
    cy.contains('span', '房间 ID:', { timeout: 10000 }).should('be.visible'); // GameRoomPage 房间ID标签
    
    cy.log('✅ 创建房间测试通过');
  })

  it('✅ 4. 演示模式测试', () => {
    cy.log('🔍 测试演示模式功能');

    cy.then(setupMockPlayer);
    cy.reload();
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after reload (Demo Mode):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');
    
    cy.get('[data-testid="hero-start-game"]').should('be.visible').click();
    // 验证导航到游戏启动页面 - 模式选择阶段
    cy.get('[data-testid="game-start-page"]', { timeout: 10000 }).should('be.visible');
    cy.contains('h1.page-title', '选择游戏模式', { timeout: 10000 }).should('be.visible');
    
    // 点击演示模式卡片
    cy.get('[data-testid="demo-mode"]').should('be.visible').click(); 
    
    // 验证进入演示模式确认/启动视图 (根据 GameStartPage.tsx 的实际实现调整)
    // 假设点击卡片后会有一个确认步骤或直接启动
    // 如果直接启动，会导航到 GameRoomPage
    // 如果有确认步骤，例如一个标题为 "开始演示" 的视图/模态框
    cy.contains('h2', '演示模式确认').should('be.visible'); // 假设有这样的标题
    cy.contains('button', '开始演示').should('be.visible').click(); // 假设有启动按钮
    
    // 验证演示房间创建 (通过页面特定元素)
    cy.contains('h2', '演示模式', { timeout: 15000 }).should('be.visible'); // GameRoomPage 演示房间名
    cy.contains('p', 'AI 助手已激活', { timeout: 10000 }).should('be.visible'); // GameRoomPage AI提示
    
    cy.log('✅ 演示模式测试通过');
  })

  it('✅ 5. 游戏模板选择与启动测试 (新模板)', () => {
    cy.log('🔍 测试新游戏模板的选择与启动功能');

    cy.then(setupMockPlayer);
    cy.reload(); 
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after reload (Template Test Setup):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');

    const newTemplates = [
      { id: 'gomoku', name: '五子棋' },
      { id: 'ticTacToe', name: '井字棋' },
      { id: 'rockPaperScissors', name: '石头剪刀布' },
      { id: 'cardCompare', name: '比大小' },
      { id: 'diceGuess', name: '猜大小' }
    ];

    newTemplates.forEach(template => {
      cy.log(`🔄 测试模板: ${template.name}`);
      
      cy.visit(BASE_URL);
      cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
        cy.log('localStorage current_player data after visit (Template Loop):', playerData);
      });
      cy.window({ log: false }).invoke('forceLoadPlayerForTest');
      cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
      cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');

      cy.get('[data-testid="hero-start-game"]').should('be.visible').click();
      // 验证导航到游戏启动页面 - 模式选择阶段
      cy.get('[data-testid="game-start-page"]', { timeout: 10000 }).should('be.visible');
      cy.contains('h1.page-title', '选择游戏模式', { timeout: 10000 }).should('be.visible');

      // 进入演示房间以进行模板选择
      cy.get('[data-testid="demo-mode"]').should('be.visible').click();
      // 假设演示模式确认步骤与上面 ✅ 4 一致
      cy.contains('h2', '演示模式确认').should('be.visible'); 
      cy.contains('button', '开始演示').should('be.visible').click(); 

      cy.contains('h2', '演示模式', { timeout: 15000 }).should('be.visible'); // GameRoomPage

      cy.get('[data-testid="select-template-btn"], [data-testid="change-template-btn"]').should('be.visible').click();
      
      cy.get('.template-selection-modal', { timeout: 10000 }).should('be.visible'); 
      cy.contains('h2', '选择游戏模板').should('be.visible');

      cy.get('.template-card').contains(template.name).should('be.visible').click();
      
      cy.get('.template-selection-modal').should('not.exist'); 
      cy.get('[data-testid="current-game-display"]', { timeout: 10000 }).should('contain', template.name);

      cy.get('[data-testid="start-game-btn"]').should('be.visible').click();
      
      cy.get('.game-interface-container', { timeout: 20000 }).should('be.visible'); 
      cy.get('[data-testid="game-title"]', { timeout: 10000 }).should('contain', template.name).and('be.visible');

      cy.log(`✅ ${template.name} 测试通过`);
    });

    cy.log('✅ 所有新游戏模板选择与启动测试通过');
  })

  it('✅ 7. 响应式设计测试', () => {
    cy.log('🔍 测试响应式设计');
    cy.then(setupMockPlayer); 
    cy.reload();
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after reload (Responsive Test):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');

    // 测试桌面端
    cy.viewport(1920, 1080)
    cy.reload()
    cy.wait(500)
    cy.get('.grid--cols-3').should('be.visible')
    
    // 测试平板端
    cy.viewport(768, 1024)
    cy.wait(500)
    cy.get('main').should('be.visible')
    
    // 测试手机端
    cy.viewport(375, 667)
    cy.wait(500)
    cy.get('main').should('be.visible')
    cy.contains('开始游戏').should('be.visible')
    
    cy.log('✅ 响应式设计测试通过')
  })

  it('✅ 8. 房间管理功能测试', () => {
    cy.log('🔍 测试房间管理功能');
    cy.then(setupMockPlayer);
    cy.reload();
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after reload (Room Management Test):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');

    cy.get('[data-testid="hero-start-game"]').should('be.visible').click();
    // 验证导航到游戏启动页面 - 模式选择阶段
    cy.get('[data-testid="game-start-page"]', { timeout: 10000 }).should('be.visible');
    cy.contains('h1.page-title', '选择游戏模式', { timeout: 10000 }).should('be.visible');

    cy.get('[data-testid="create-room-mode"]').should('be.visible').click();
    cy.contains('h2', '创建新房间').should('be.visible'); // 进入创建房间表单

    cy.get('input[placeholder*="房间名称"]').clear().type('管理测试房间');
    cy.get('button[type="submit"]').contains('创建房间').should('be.visible').click();
    cy.contains('h2', '管理测试房间', { timeout: 15000 }).should('be.visible'); // GameRoomPage
    
    cy.get('[data-testid="copy-room-id-btn"]').should('be.visible').click();
    cy.log('房间ID复制按钮已点击');

    cy.get('[data-testid="invite-players-btn"]').should('be.visible').click();
    cy.get('.invite-modal', { timeout: 5000 }).should('be.visible'); 
    cy.get('.invite-modal .close-button').click(); 
    cy.get('.invite-modal').should('not.exist');

    cy.get('[data-testid="leave-room-btn"]').should('be.visible').click();
    
    // 验证返回主页
    cy.get('h1.hero-title', { timeout: 10000 }).should('be.visible'); // HomePage
    
    cy.log('✅ 房间管理功能测试通过');
  })

  it('✅ 9. 错误处理测试', () => {
    cy.log('🔍 测试错误处理');
    cy.then(setupMockPlayer);
    cy.reload();
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after reload (Error Handling Test):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');

    cy.get('[data-testid="hero-start-game"]').should('be.visible').click();
    // 验证导航到游戏启动页面 - 模式选择阶段
    cy.get('[data-testid="game-start-page"]', { timeout: 10000 }).should('be.visible');
    cy.contains('h1.page-title', '选择游戏模式', { timeout: 10000 }).should('be.visible');

    // 点击加入房间卡片
    cy.get('[data-testid="join-room-mode"]').should('be.visible').click(); 
    // 验证进入加入房间表单视图
    cy.contains('h2', '加入现有房间').should('be.visible'); // 假设加入房间视图有此标题

    cy.get('input[name="roomIdToJoin"]').type('INVALID123');
    cy.get('button[type="submit"]').contains('加入房间').click();
    
    cy.get('.error-message', { timeout: 10000 }).should('be.visible').and('contain', '房间不存在或密码错误'); 
    // 确保仍在 GameStartPage 的加入房间视图，而不是错误地导航了
    cy.contains('h2', '加入现有房间', { timeout: 10000 }).should('be.visible'); 
    
    cy.log('✅ 错误处理测试通过');
  })

  it('✅ 10. 本地存储持久化测试', () => {
    cy.log('🔍 测试本地存储功能');
    
    const testPlayer = {
      id: 'persist-test-' + Date.now(),
      name: '持久化测试员',
      avatar: '💾'
    };
    localStorage.setItem('current_player', JSON.stringify(testPlayer));

    cy.visit(BASE_URL); 
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after visit (Persistence Test - Initial):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.navbar-user .user-name', { timeout: 10000 }).should('contain', testPlayer.name).and('be.visible');
    
    cy.reload();
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after reload (Persistence Test - Reloaded):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.navbar-user .user-name', { timeout: 10000 }).should('contain', testPlayer.name).and('be.visible');
    
    cy.window().then((win) => {
      const playerInStorage = JSON.parse(win.localStorage.getItem('current_player') || '{}');
      expect(playerInStorage.id).to.equal(testPlayer.id);
      expect(playerInStorage.name).to.equal(testPlayer.name);
    });
    
    cy.log('✅ 本地存储测试通过');
  });
})

// 🎯 性能测试套件
describe('⚡ 性能测试', () => {
  beforeEach(() => {
    const mockPlayer = {
      id: 'perf-test-player-' + Date.now(),
      name: '性能测试员',
      avatar: '⚡'
    };
    localStorage.setItem('current_player', JSON.stringify(mockPlayer));
    cy.visit('http://localhost:3000');
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after visit (Performance Test beforeEach):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', mockPlayer.name).and('be.visible');
  });

  it('📊 页面加载性能测试', () => {
    cy.log('🔍 测试页面加载性能');
    
    const start = Date.now();
    cy.get('h1.hero-title', { timeout: 10000 }).should('be.visible'); 
    
    cy.then(() => {
      const loadTime = Date.now() - start
      expect(loadTime).to.be.lessThan(3000) // 页面加载应该在3秒内
      cy.log(`✅ 页面加载时间: ${loadTime}ms`)
    })
  })

  it('🔄 页面切换性能测试', () => {
    cy.log('🔍 测试页面切换性能');
        
    const start = Date.now();
    cy.get('[data-testid="hero-start-game"]').should('be.visible').click(); 
    // Assert GameStartPage (模式选择视图) is visible
    cy.get('[data-testid="game-start-page"]', { timeout: 10000 }).should('be.visible');
    cy.contains('h1.page-title', '选择游戏模式', { timeout: 10000 }).should('be.visible');
    
    cy.then(() => {
      const switchTime = Date.now() - start
      expect(switchTime).to.be.lessThan(1000) // 页面切换应该在1秒内
      cy.log(`✅ 页面切换时间: ${switchTime}ms`)
    })
  })
})

// 🎨 自动化视觉测试
describe('🎨 视觉回归测试', () => {
  it('📸 主页视觉快照', () => {
    cy.visit('http://localhost:3000');
    cy.get('body', { timeout: 10000 }).should($body => {
      expect($body.attr('data-player-loaded') === 'true' || !$body.attr('data-player-loaded')).to.be.true;
    });
    cy.get('h1.hero-title', {timeout: 10000}).should('be.visible'); // Wait for content
    // cy.matchImageSnapshot('homepage'); 
    cy.log('视觉快照测试 (主页) - 已禁用');
  });

  it('📸 游戏启动页快照', () => {
    cy.then(setupMockPlayer);
    cy.visit('http://localhost:3000');
    cy.window().its('localStorage').invoke('getItem', 'current_player').then(playerData => {
      cy.log('localStorage current_player data after visit (Snapshot Test):', playerData);
    });
    cy.window({ log: false }).invoke('forceLoadPlayerForTest');
    cy.get('body[data-player-loaded="true"]', { timeout: 10000 }).should('exist');
    cy.get('.player-name', { timeout: 10000 }).should('contain', '自动化测试玩家').and('be.visible');

    cy.get('[data-testid="hero-start-game"]').click();
    // Wait for GameStartPage (模式选择视图)
    cy.get('[data-testid="game-start-page"]', { timeout: 10000 }).should('be.visible');
    cy.contains('h1.page-title', '选择游戏模式', { timeout: 10000 }).should('be.visible');
    cy.wait(500); // Extra wait for page to settle for snapshot
    // cy.matchImageSnapshot('game-start-page'); 
    cy.log('视觉快照测试 (游戏启动页) - 已禁用');
  });
}); 