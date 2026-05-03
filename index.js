// AI Character Generator - 日夜间模式 + 智能世界书扩展版
// 包含：角色卡、用户人设、批量生成、世界书、世界扩展、关系网、魔法衣橱(含QQ服装)、故事生成器、玩法生成器、小说生成器、小剧场、心理学分析(含MBTI)、文风生成、预设生成、自定义页面管理器

(function() {
setTimeout(() => {
try {
initPlugin();
} catch (e) {
console.warn("AI人设生成器启动失败:", e);
}
}, 1000);

// ============================================================================
// API配置存储
// ============================================================================

const EXTENSION_NAME = 'ai_char_gen';
const STORAGE_KEYS = {
    API_CONFIG: 'api_config',
    CUSTOM_TEMPLATES: 'custom_templates',
    CUSTOM_PAGES: 'custom_pages',
    ACTIVE_TABS: 'active_tabs'
};

const DEFAULT_API_CONFIG = {
    apiUrl: '',
    apiKey: '',
    apiModel: '',
    availableModels: []
};

let apiConfig = { ...DEFAULT_API_CONFIG };
let customTemplates = {
    character: '',
    user: '',
    worldbook: '',
    relationship: '',
    wardrobe: '',
    worldExtend: {}
};

let customPages = [];

function saveApiConfig() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_${STORAGE_KEYS.API_CONFIG}`, JSON.stringify(apiConfig));
    } catch (e) {
        console.error('保存API配置失败:', e);
    }
}

function loadApiConfig() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_${STORAGE_KEYS.API_CONFIG}`);
        if (saved) {
            apiConfig = { ...DEFAULT_API_CONFIG, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('加载API配置失败:', e);
    }
}

function loadCustomTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_${STORAGE_KEYS.CUSTOM_TEMPLATES}`);
        if (saved) {
            customTemplates = { ...customTemplates, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('加载自定义模板失败:', e);
    }
}

function saveCustomTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_${STORAGE_KEYS.CUSTOM_TEMPLATES}`, JSON.stringify(customTemplates));
    } catch (e) {
        console.error('保存自定义模板失败:', e);
    }
}

function loadCustomPages() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_${STORAGE_KEYS.CUSTOM_PAGES}`);
        if (saved) {
            customPages = JSON.parse(saved);
        }
    } catch (e) {
        console.error('加载自定义页面失败:', e);
    }
}

function saveCustomPages() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_${STORAGE_KEYS.CUSTOM_PAGES}`, JSON.stringify(customPages));
    } catch (e) {
        console.error('保存自定义页面失败:', e);
    }
}

// ============================================================================
// 选项卡管理器
// ============================================================================

const builtInTabs = {
    api: 'API',
    char: '角色卡',
    batch: '批量生成',
    user: '用户人设',
    world: '世界书',
    'world-extend': '世界扩展',
    relation: '关系网',
    wardrobe: '魔法衣橱',
    story: '故事生成器',
    playmix: '玩法生成器',
    novel: '小说生成器',
    theater: '小剧场',
    psychology: '心理学分析',
    stylegen: '文风生成',
    presetgen: '预设生成',
    'custom-mgr': '自定义页面',
    history: '历史',
    templates: '模板库',
    'template-edit': '模板编辑',
    theme: '主题',
    size: '大小'
};

function getActiveTabs() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_${STORAGE_KEYS.ACTIVE_TABS}`);
        if (saved && JSON.parse(saved).length > 0) {
            return JSON.parse(saved);
        }
    } catch(e) {}
    return ['api', 'char', 'batch', 'user', 'world', 'wardrobe', 'story', 'novel', 'custom-mgr'];
}

function saveActiveTabs(tabs) {
    localStorage.setItem(`${EXTENSION_NAME}_${STORAGE_KEYS.ACTIVE_TABS}`, JSON.stringify(tabs));
}

function hideTab(tabId) {
    const active = getActiveTabs();
    if (active.includes(tabId)) {
        const newActive = active.filter(id => id !== tabId);
        saveActiveTabs(newActive);
        rebuildTabsAndContents();
    }
}

function restoreAllTabs() {
    saveActiveTabs(Object.keys(builtInTabs));
    rebuildTabsAndContents();
}

// ============================================================================
// 默认模板（角色卡已扩充）
// ============================================================================

const DEFAULT_CHAR_TEMPLATE = `char_name:
  Chinese name: 
  Nickname: 
  age: 
  gender: 
  height: 
  identity:
    - 
  background_story:
    童年(0-12岁):
    少年(13-18岁):
    青年(19-35岁):
    中年(35-至今):
    现状:
  
  social_status: 
    - 

  appearance:
    hair: 
    eyes: 
    skin:
    face_style: 
    build: 
      - 
  attire:
    business_formal:
    business_casual:
    casual_wear:
    home_wear:

  archetype: 

  personality:
    core_traits: 
      - : ""
    romantic_traits: 
      - : ""
       
  lifestyle_behaviors:
    - 
    - 
  
  work_behaviors:
    - 
  
  emotional_behaviors:
    angry:
    happy: 

  goals:
    - 
  
  weakness:
    - 

  likes:
    - 

  dislikes:
    - 
  
  skills:
    - 工作: ["",""]
    - 生活: ["",""]
    - 爱好: ["",""]

  NSFW_information:
    Sex_related traits:
      experiences: 
      sexual_orientation: 
      sexual_role: 
      sexual_habits: 
        - 
    Kinks: 
    Limits:

  住所与生活环境:
    居住地类型: 
    具体位置: 
    家里布设风格: 
    卧室风格: 
    最常待的角落: 

  动物塑:
    最像的动物: 
    理由: 

  已掌握技能:
    战斗类: 
    生活类: 
    专业类: 
    隐藏技能: 

  关系距离矩阵:
    对方名称:
      信任值: [0-10]
      依赖值: [0-10]
      防备值: [0-10]
      愧疚值: [0-10]
      控制值: [0-10]
      服从值: [0-10]
      吸引力: [0-10]

  矛盾清单:
    - 
    - `;

const DEFAULT_RELATIONSHIP_TEMPLATE = `角色A:
  姓名:
  身份:
  性格简述:

角色B:
  姓名:
  身份:
  性格简述:

彼此身份:
  A对B的称呼:
  B对A的称呼:
  社会关系:

对对方的看法:
  A眼中的B:
  B眼中的A:

关系性质:
  表面关系:
  实际关系:
  关系亲密度: [1-10]

隐秘心理:
  A的隐秘想法:
  B的隐秘想法:

对对方的期望:
  A期望B:
  B期望A:

互动模式:
  日常相处:
  冲突时的表现:
  特殊情境:

信任程度: [1-10]

冲突点:
  潜在矛盾:
  已有争执:

关系发展:
  过去:
  现在:
  未来可能:`;

const DEFAULT_WARDROBE_TEMPLATE = `外貌特征:
  发型:
    样式:
    颜色:
    长度:
  眼睛:
    颜色:
    形状:
    特征:
  肤色:
    色调:
    质感:
  脸型:
    轮廓:
    特点:
  五官:
    鼻子:
    嘴唇:
    眉毛:
  特殊印记:
    胎记:
    疤痕:
    纹身:

体型特征:
  身高:
  体重:
  身材类型:
  胸部:
    尺寸:
    形状:
  腰部:
    粗细:
    线条:
  臀部:
    大小:
    形状:
  腿部:
    长度:
    线条:

服饰打扮:
  上装:
    款式:
    颜色:
    材质:
    细节:
  下装:
    款式:
    颜色:
    材质:
  外套:
    款式:
    颜色:
    材质:
  鞋履:
    款式:
    颜色:
    材质:
  配饰:
    首饰:
    头饰:
    腰带:
    其他:
  随身物品:
    物品1:
    物品2:
  特殊装饰:
    图案:
    挂件:

整体风格:
  日常风格:
  特殊场合风格:`;

const DEFAULT_WORLDBOOK_PROMPT = `根据用户输入的世界观描述，生成完整的世界书设定。包括背景、时代、势力、事件、文化、科技等。`;

const DEFAULT_WORLD_EXTEND_TEMPLATES = {
    location: `地点扩展:
  地点名称:
  地理位置:
  描述:
  重要性:
  相关事件:
  居住/出没人物:`,
    faction: `势力扩展:
  势力名称:
  类型:
  宗旨:
  领袖:
  成员:
  实力:
  影响力范围:
  与其他势力关系:`,
    event: `事件扩展:
  事件名称:
  时间:
  地点:
  涉及人物:
  起因:
  经过:
  结果:
  影响:`,
    culture: `文化扩展:
  文化名称:
  表现形式:
  起源:
  特点:
  相关习俗:
  禁忌:
  代表人物:`,
    technology: `科技扩展:
  科技名称:
  类型:
  原理:
  应用:
  发展阶段:
  限制:
  发明者:`,
    character: `重要人物扩展:
  姓名:
  身份:
  外貌:
  性格:
  背景:
  能力:
  目标:
  人际关系:`
};

// 初始化自定义模板
if (!customTemplates.character) customTemplates.character = DEFAULT_CHAR_TEMPLATE;
if (!customTemplates.user) customTemplates.user = DEFAULT_CHAR_TEMPLATE;
if (!customTemplates.relationship) customTemplates.relationship = DEFAULT_RELATIONSHIP_TEMPLATE;
if (!customTemplates.wardrobe) customTemplates.wardrobe = DEFAULT_WARDROBE_TEMPLATE;
if (!customTemplates.worldbook) customTemplates.worldbook = DEFAULT_WORLDBOOK_PROMPT;
if (!customTemplates.worldExtend) customTemplates.worldExtend = { ...DEFAULT_WORLD_EXTEND_TEMPLATES };

// ============================================================================
// API配置UI渲染
// ============================================================================

function renderApiConfigPanel() {
    return `
        <div class="apg-api-config">
            <h4 style="margin: 0 0 12px 0; font-size: 14px;">API 配置</h4>
            <div class="field" style="margin-bottom: 12px;">
                <label>API 地址</label>
                <input type="text" id="apg-api-url" placeholder="https://api.openai.com/v1" value="${escapeHtml(apiConfig.apiUrl)}">
            </div>
            <div class="field" style="margin-bottom: 12px;">
                <label>API Key</label>
                <input type="password" id="apg-api-key" placeholder="sk-..." value="${escapeHtml(apiConfig.apiKey)}">
            </div>
            <div class="field" style="margin-bottom: 12px;">
                <label>模型</label>
                <select id="apg-api-model">
                    <option value="">请先拉取模型列表</option>
                    ${apiConfig.availableModels.map(m => `<option value="${escapeHtml(m)}" ${apiConfig.apiModel === m ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
                </select>
            </div>
            <div class="button-group" style="margin: 12px 0;">
                <button id="apg-test-connection">测试连接</button>
                <button id="apg-fetch-models">拉取模型列表</button>
                <button id="apg-use-local-api">使用酒馆本地API</button>
            </div>
            <div id="apg-api-status" class="apg-api-status" style="font-size: 12px; margin-top: 8px;"></div>
        </div>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================================================
// API配置事件绑定
// ============================================================================

function bindApiConfigEvents() {
    const urlInput = document.getElementById('apg-api-url');
    const keyInput = document.getElementById('apg-api-key');
    const modelSelect = document.getElementById('apg-api-model');
    
    if (urlInput) {
        urlInput.addEventListener('change', () => {
            apiConfig.apiUrl = urlInput.value;
            saveApiConfig();
        });
    }
    
    if (keyInput) {
        keyInput.addEventListener('change', () => {
            apiConfig.apiKey = keyInput.value;
            saveApiConfig();
        });
    }
    
    if (modelSelect) {
        modelSelect.addEventListener('change', () => {
            apiConfig.apiModel = modelSelect.value;
            saveApiConfig();
        });
    }
    
    const testBtn = document.getElementById('apg-test-connection');
    if (testBtn) {
        testBtn.addEventListener('click', testApiConnection);
    }
    
    const fetchBtn = document.getElementById('apg-fetch-models');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', fetchModelList);
    }
    
    const useLocalBtn = document.getElementById('apg-use-local-api');
    if (useLocalBtn) {
        useLocalBtn.addEventListener('click', useLocalApiConfig);
    }
}

// ============================================================================
// API功能函数
// ============================================================================

async function testApiConnection() {
    const statusDiv = document.getElementById('apg-api-status');
    if (!statusDiv) return;
    
    const url = apiConfig.apiUrl || document.getElementById('apg-api-url')?.value;
    const key = apiConfig.apiKey || document.getElementById('apg-api-key')?.value;
    
    if (!url) {
        statusDiv.innerHTML = '<span style="color: #d32f2f;">请填写API地址</span>';
        return;
    }
    
    statusDiv.innerHTML = '<span style="color: #ff9800;">测试中...</span>';
    
    try {
        const baseUrl = url.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            statusDiv.innerHTML = '<span style="color: #4caf50;">连接成功！</span>';
            toastr.success('API连接成功');
        } else {
            statusDiv.innerHTML = `<span style="color: #d32f2f;">连接失败: ${response.status}</span>`;
            toastr.error(`连接失败: ${response.status}`);
        }
    } catch (e) {
        statusDiv.innerHTML = `<span style="color: #d32f2f;">连接失败: ${e.message}</span>`;
        toastr.error(`连接失败: ${e.message}`);
    }
}

async function fetchModelList() {
    const statusDiv = document.getElementById('apg-api-status');
    const modelSelect = document.getElementById('apg-api-model');
    
    if (!statusDiv || !modelSelect) return;
    
    const url = apiConfig.apiUrl || document.getElementById('apg-api-url')?.value;
    const key = apiConfig.apiKey || document.getElementById('apg-api-key')?.value;
    
    if (!url) {
        statusDiv.innerHTML = '<span style="color: #d32f2f;">请填写API地址</span>';
        return;
    }
    
    statusDiv.innerHTML = '<span style="color: #ff9800;">拉取模型列表中...</span>';
    
    try {
        const baseUrl = url.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            let models = [];
            
            if (data.data && Array.isArray(data.data)) {
                models = data.data.map(m => m.id || m);
            } else if (Array.isArray(data)) {
                models = data;
            }
            
            if (models.length > 0) {
                apiConfig.availableModels = models;
                apiConfig.apiUrl = url;
                apiConfig.apiKey = key;
                saveApiConfig();
                
                modelSelect.innerHTML = models.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
                statusDiv.innerHTML = `<span style="color: #4caf50;">已获取 ${models.length} 个模型</span>`;
                toastr.success(`已获取 ${models.length} 个模型`);
            } else {
                statusDiv.innerHTML = '<span style="color: #d32f2f;">未获取到模型列表</span>';
            }
        } else {
            statusDiv.innerHTML = `<span style="color: #d32f2f;">获取失败: ${response.status}</span>`;
            toastr.error(`获取失败: ${response.status}`);
        }
    } catch (e) {
        statusDiv.innerHTML = `<span style="color: #d32f2f;">获取失败: ${e.message}</span>`;
        toastr.error(`获取失败: ${e.message}`);
    }
}

function useLocalApiConfig() {
    try {
        let localUrl = '';
        let localKey = '';
        
        if (window.SillyTavern && window.SillyTavern.chatCompletionSettings) {
            const settings = window.SillyTavern.chatCompletionSettings;
            localUrl = settings.api_url || settings.url || '';
            localKey = settings.api_key || settings.key || '';
        }
        
        const context = getContext?.();
        if (context && context.chatSettings) {
            localUrl = context.chatSettings.api_url || localUrl;
            localKey = context.chatSettings.api_key || localKey;
        }
        
        if (localUrl && localKey) {
            apiConfig.apiUrl = localUrl;
            apiConfig.apiKey = localKey;
            saveApiConfig();
            updateApiConfigUI();
            
            const statusDiv = document.getElementById('apg-api-status');
            if (statusDiv) {
                statusDiv.innerHTML = '<span style="color: #4caf50;">已读取酒馆API配置</span>';
            }
            toastr.success('已读取酒馆当前API配置');
        } else {
            toastr.warning('未找到酒馆API配置');
        }
    } catch (e) {
        console.error('[APG] 读取本地API失败:', e);
        toastr.error('读取失败');
    }
}

function updateApiConfigUI() {
    const urlInput = document.getElementById('apg-api-url');
    const keyInput = document.getElementById('apg-api-key');
    const modelSelect = document.getElementById('apg-api-model');
    
    if (urlInput) urlInput.value = apiConfig.apiUrl;
    if (keyInput) keyInput.value = apiConfig.apiKey;
    if (modelSelect) {
        modelSelect.innerHTML = '<option value="">请先拉取模型列表</option>' + 
            apiConfig.availableModels.map(m => `<option value="${escapeHtml(m)}" ${apiConfig.apiModel === m ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('');
    }
}

// ============================================================================
// API调用函数（核心）
// ============================================================================

async function callApi(messages, systemPrompt = null, options = {}) {
    const url = apiConfig.apiUrl;
    const key = apiConfig.apiKey;
    const model = apiConfig.apiModel;
    
    if (!url || !key || !model) {
        throw new Error('请先配置API地址、Key和模型');
    }
    
    const fullMessages = [];
    if (systemPrompt) {
        fullMessages.push({ role: 'system', content: systemPrompt });
    }
    fullMessages.push(...messages);
    
    const baseUrl = url.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: model,
            messages: fullMessages,
            temperature: options.temperature ?? 0.85,
            max_tokens: options.max_tokens ?? 4096
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API错误 (${response.status}): ${errorText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// ============================================================================
// 原有配置（非API部分）
// ============================================================================

function initPlugin() {
const PANEL_ID = 'ai-char-generator-panel';

loadApiConfig();
loadCustomTemplates();
loadCustomPages();

let config = {
themeMode: 'light',
panelWidth: 380,
panelHeight: 720,
panelLeft: 20,
panelTop: 50,
savedTemplates: [],
generationHistory: [],
draftContent: {},
relationChars: []
};

function getInitialPanelWidth() {
    const screenWidth = window.innerWidth;
    let initialWidth = config.panelWidth;
    if (initialWidth > screenWidth - 40 || initialWidth === 380) {
        initialWidth = Math.min(screenWidth - 40, 380);
        if (initialWidth < 200) initialWidth = 200;
    }
    return initialWidth;
}
config.panelWidth = getInitialPanelWidth();

try {
const saved = localStorage.getItem('ai_char_gen_config');
if (saved) {
const parsed = JSON.parse(saved);
config = { ...config, ...parsed };
if (!config.savedTemplates) config.savedTemplates = [];
if (!config.generationHistory) config.generationHistory = [];
if (!config.draftContent) config.draftContent = {};
if (!config.relationChars) config.relationChars = [];
if (config.panelLeft + config.panelWidth > window.innerWidth - 10) {
config.panelLeft = Math.max(10, window.innerWidth - config.panelWidth - 10);
}
}
} catch (err) {}

function saveConfig() {
localStorage.setItem('ai_char_gen_config', JSON.stringify(config));
}

function addToHistory(type, input, output) {
config.generationHistory.unshift({
type, input: input.substring(0, 80), output,
timestamp: new Date().toLocaleString()
});
if (config.generationHistory.length > 20) config.generationHistory.pop();
saveConfig();
refreshHistoryList();
}

function saveDraft(tabId, content) {
config.draftContent[tabId] = content;
saveConfig();
}

function loadDraft(tabId) {
return config.draftContent[tabId] || '';
}

function exportTemplates() {
const data = JSON.stringify(config.savedTemplates, null, 2);
const blob = new Blob([data], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `templates_${new Date().toISOString().slice(0,19)}.json`;
a.click();
URL.revokeObjectURL(url);
toastr.success('已导出');
}

function importTemplates(file) {
const reader = new FileReader();
reader.onload = (e) => {
try {
const imported = JSON.parse(e.target.result);
if (Array.isArray(imported)) {
config.savedTemplates = [...config.savedTemplates, ...imported];
saveConfig();
refreshTemplateList();
toastr.success(`导入 ${imported.length} 个模板`);
} else {
toastr.error('文件格式错误');
}
} catch (err) {
toastr.error('解析失败');
}
};
reader.readAsText(file);
}

function refreshHistoryList() {
const container = document.getElementById('history-list');
if (!container) return;
if (config.generationHistory.length === 0) {
container.innerHTML = '<div class="empty-state">暂无历史</div>';
return;
}
container.innerHTML = config.generationHistory.map((h, i) => `
<div class="history-item" data-index="${i}">
<div class="history-type">${h.type}</div>
<div class="history-time">${h.timestamp}</div>
<div class="history-preview">${h.input}</div>
</div>
`).join('');
container.querySelectorAll('.history-item').forEach(item => {
item.onclick = () => {
const h = config.generationHistory[parseInt(item.dataset.index)];
if (h) {
if (h.type === '角色卡') document.getElementById('char-result').value = h.output;
else if (h.type === '用户人设') document.getElementById('user-result').value = h.output;
else if (h.type === '世界书') document.getElementById('world-result').value = h.output;
else if (h.type === '世界书扩展') document.getElementById('world-extend-result').value = h.output;
else if (h.type === '关系描述') document.getElementById('relation-result').value = h.output;
else if (h.type === '魔法衣橱') document.getElementById('wardrobe-result').value = h.output;
toastr.success(`已加载: ${h.type}`);
}
};
});
}

function refreshTemplateList() {
const container = document.getElementById('template-list');
if (!container) return;
if (config.savedTemplates.length === 0) {
container.innerHTML = '<div class="empty-state">暂无模板</div>';
return;
}
container.innerHTML = config.savedTemplates.map((t, i) => `
<div class="template-item">
<span>${t.name}</span>
<div class="template-actions">
<button class="load-template" data-index="${i}">加载</button>
<button class="delete-template" data-index="${i}">删除</button>
</div>
</div>
`).join('');
container.querySelectorAll('.load-template').forEach(btn => {
btn.onclick = () => {
const t = config.savedTemplates[parseInt(btn.dataset.index)];
const active = document.querySelector('.tab-content.active');
const result = active?.querySelector('.result-text');
if (result) result.value = t.content;
toastr.success(`已加载: ${t.name}`);
};
});
container.querySelectorAll('.delete-template').forEach(btn => {
btn.onclick = () => {
config.savedTemplates.splice(parseInt(btn.dataset.index), 1);
saveConfig();
refreshTemplateList();
toastr.success('已删除');
};
});
}

// ========== 角色卡 ==========
async function generateCharacter(userInput, cardType, btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
toastr.error('请先配置 API（地址、Key、模型）');
return null;
}
const typeName = cardType === 'character' ? '角色卡' : '用户人设';
const template = cardType === 'character' ? customTemplates.character : customTemplates.user;
const systemPrompt = `根据用户输入，生成完整的${typeName}。严格按照以下YAML格式输出，所有字段都要填满，不要添加额外解释：

${template}`;

if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }

try {
const content = await callApi(
[{ role: 'user', content: userInput }],
systemPrompt,
{ temperature: 0.8, max_tokens: 4000 }
);
let cleanedContent = content.replace(/```yaml\n?/g, '').replace(/```\n?/g, '').trim();
if (resultArea) {
resultArea.value = cleanedContent;
addToHistory(typeName, userInput, cleanedContent);
const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
if (copyBtn) copyBtn.disabled = false;
}
toastr.success('生成成功');
return cleanedContent;
} catch (err) {
toastr.error(`失败: ${err.message}`);
return null;
} finally {
if (btn) { btn.disabled = false; btn.textContent = cardType === 'character' ? '生成角色卡' : '生成用户人设'; }
}
}

// ========== 世界书 ==========
async function generateWorldbook(userInput, btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
toastr.error('请先配置 API（地址、Key、模型）');
return null;
}
if (!userInput.trim()) { toastr.warning('请输入设定要求'); return null; }
const systemPrompt = customTemplates.worldbook;
if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
try {
const content = await callApi(
[{ role: 'user', content: userInput }],
systemPrompt,
{ temperature: 0.9, max_tokens: 4000 }
);
if (resultArea) {
resultArea.value = content;
addToHistory('世界书', userInput, content);
const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
if (copyBtn) copyBtn.disabled = false;
}
toastr.success('生成成功');
return content;
} catch (err) {
toastr.error(`失败: ${err.message}`);
return null;
} finally {
if (btn) { btn.disabled = false; btn.textContent = '生成世界书'; }
}
}

// ========== 关系网文字 ==========
let relationChars = [];
function addRelationChar(name, desc) {
if (!name) return;
relationChars.push({ name, desc: desc || '' });
config.relationChars = relationChars;
saveConfig();
refreshRelationList();
}
function removeRelationChar(index) {
relationChars.splice(index, 1);
config.relationChars = relationChars;
saveConfig();
refreshRelationList();
}
function refreshRelationList() {
const container = document.getElementById('relation-list');
if (!container) return;
if (relationChars.length === 0) {
container.innerHTML = '<div class="empty-state">暂无角色</div>';
return;
}
container.innerHTML = relationChars.map((c, i) => `
<div class="char-item">
<span><strong>${c.name}</strong>${c.desc ? ` - ${c.desc.substring(0, 40)}` : ''}</span>
<button class="delete-char" data-index="${i}">删除</button>
</div>
`).join('');
container.querySelectorAll('.delete-char').forEach(btn => {
btn.onclick = () => removeRelationChar(parseInt(btn.dataset.index));
});
}
relationChars = config.relationChars || [];
refreshRelationList();

async function generateRelationText(btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
toastr.error('请先配置 API（地址、Key、模型）');
return null;
}
if (relationChars.length < 2) { toastr.warning('至少需要2个角色'); return null; }
const charList = relationChars.map(c => `- ${c.name}: ${c.desc || '暂无描述'}`).join('\n');
const systemPrompt = `根据以下角色信息，生成两个角色之间的详细关系描述。严格按照以下YAML格式输出，所有字段都要填满：

${customTemplates.relationship}

关系类型参考：[挚友/恋人/仇敌/师徒/家人/同事/陌生人]`;
if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
try {
const content = await callApi(
[{ role: 'user', content: charList }],
systemPrompt,
{ temperature: 0.7, max_tokens: 3000 }
);
if (resultArea) {
resultArea.value = content;
addToHistory('关系描述', `角色数:${relationChars.length}`, content);
const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
if (copyBtn) copyBtn.disabled = false;
}
toastr.success('生成成功');
return content;
} catch (err) {
toastr.error(`失败: ${err.message}`);
return null;
} finally {
if (btn) { btn.disabled = false; btn.textContent = '生成关系描述'; }
}
}

// ========== 魔法衣橱 ==========
let qqClothingTemplates = {
    freeform: ''
};

function loadQQClothingTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_qq_clothing_templates`);
        if (saved) {
            qqClothingTemplates = { ...qqClothingTemplates, ...JSON.parse(saved) };
        }
    } catch(e) {}
}

function saveQQClothingTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_qq_clothing_templates`, JSON.stringify(qqClothingTemplates));
    } catch(e) {}
}

async function generateWardrobe(userInput, mode, subMode, btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API（地址、Key、模型）');
        return null;
    }
    if (!userInput.trim() && mode !== 'qq') { 
        toastr.warning('请输入内容'); 
        return null; 
    }
    
    let systemPrompt = '';
    
    if (mode === 'keyword') {
        systemPrompt = `根据用户输入的关键词，生成外貌、体型、服饰等详细描述。严格按照以下YAML格式输出，所有字段都要填满。只描述客观事实，直接说明是什么样的衣服、什么样的头发、什么样的饰品。不渲染美感，仅呈现细节。

${customTemplates.wardrobe}`;
    } else if (mode === 'character') {
        systemPrompt = `根据用户输入的人设，推断这个角色平时会穿什么样的衣服、有什么样的外貌特征。严格按照以下YAML格式输出。要根据人设的性格、身份、职业合理推断，不要凭空想象。

${customTemplates.wardrobe}`;
    } else if (mode === 'scene') {
        systemPrompt = `根据用户输入的剧情片段，分析其中角色在此时应该穿什么样的衣服、有什么样的外貌状态。严格按照以下YAML格式输出。要根据剧情场景、角色状态合理推断。

${customTemplates.wardrobe}`;
    } else if (mode === 'qq') {
        let template = qqClothingTemplates.freeform || '';
        if (template && template.trim()) {
            systemPrompt = `根据用户输入（或留空则自由发挥），生成QQ服装的详细描述。参考以下用户自定义的模板进行输出：

${template}

如果用户提供了具体内容，按用户要求生成。如果用户留空，则根据常识自由发挥。`;
        } else {
            systemPrompt = `根据用户输入（或留空则自由发挥），生成QQ服装的详细描述。用户输入会提供服装要求，请生成完整的服装描述。如果留空则自由发挥。输出格式自由，用自然段落描述。`;
        }
    }
    
    if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
    try {
        let userMessage = userInput;
        if (mode === 'qq' && (!userInput || !userInput.trim())) {
            userMessage = '请自由发挥，生成一套QQ服装的描述';
        }
        
        const content = await callApi(
            [{ role: 'user', content: userMessage }],
            systemPrompt,
            { temperature: 0.8, max_tokens: 4000 }
        );
        if (resultArea) {
            resultArea.value = content;
            addToHistory('魔法衣橱', `${mode}/${subMode}: ${userInput.substring(0, 60)}`, content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success('生成成功');
        return content;
    } catch (err) {
        toastr.error(`失败: ${err.message}`);
        return null;
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '生成衣橱'; }
    }
}

// ========== 批量生成角色卡 ==========
async function batchGenerateCharacters(userInput, btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
toastr.error('请先配置 API（地址、Key、模型）');
return null;
}
const lines = userInput.split('\n').filter(l => l.trim());
if (lines.length === 0) { toastr.warning('请输入角色设定，每行一个'); return null; }

const systemPrompt = `根据用户输入，为每个角色生成完整的角色卡。严格按照以下YAML格式输出，每个角色用 "---" 分隔。所有字段都要填满。

${customTemplates.character}`;

if (btn) { btn.disabled = true; btn.textContent = '批量生成中...'; }

let results = [];
for (let i = 0; i < lines.length; i++) {
const input = lines[i];
try {
const content = await callApi(
[{ role: 'user', content: input }],
systemPrompt,
{ temperature: 0.8, max_tokens: 4000 }
);
let cleanedContent = content.replace(/```yaml\n?/g, '').replace(/```\n?/g, '').trim();
results.push(`--- ${input} ---\n${cleanedContent}`);
} catch (err) {
results.push(`[失败] ${input}: ${err.message}`);
}
}

const finalResult = results.join('\n\n');
if (resultArea) {
resultArea.value = finalResult;
addToHistory('批量角色卡', `${lines.length}个角色`, finalResult);
const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
if (copyBtn) copyBtn.disabled = false;
}
toastr.success(`生成完成，共 ${lines.length} 个角色`);
if (btn) { btn.disabled = false; btn.textContent = '批量生成'; }
}

// ========== 复制功能 ==========
function copyToClipboard(text) {
if (!text || !text.trim()) {
toastr.warning('没有内容可复制');
return;
}
navigator.clipboard.writeText(text).then(() => toastr.success('已复制')).catch(() => toastr.error('复制失败'));
}

// ========== 世界书扩展 ==========
let selectedExtendTypes = [];

function updateExtendTypes() {
const checkboxes = document.querySelectorAll('.extend-type-checkbox');
selectedExtendTypes = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
const btn = document.getElementById('world-extend-generate');
if (btn) btn.disabled = selectedExtendTypes.length === 0;
}

async function generateWorldExtend(btn) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
toastr.error('请先配置 API（地址、Key、模型）');
return;
}
if (selectedExtendTypes.length === 0) { toastr.warning('请至少选择一种扩展类型'); return; }

const sourceContent = document.getElementById('world-extend-source')?.value;
if (!sourceContent || !sourceContent.trim()) {
toastr.warning('请输入要扩展的内容');
return;
}

const typeNames = {
location: '地点',
faction: '势力',
event: '事件',
culture: '文化',
technology: '科技',
character: '重要人物'
};
const typeDesc = selectedExtendTypes.map(t => typeNames[t]).join('、');

let systemPrompt = `根据以下世界观设定，生成详细的${typeDesc}扩展。`;
for (const type of selectedExtendTypes) {
if (customTemplates.worldExtend[type]) {
systemPrompt += `\n\n${type}的格式要求：\n${customTemplates.worldExtend[type]}`;
}
}
systemPrompt += `\n\n每个类型独立成段，严格按照格式输出。`;

if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
try {
const content = await callApi(
[{ role: 'user', content: sourceContent }],
systemPrompt,
{ temperature: 0.8, max_tokens: 4000 }
);
const resultArea = document.getElementById('world-extend-result');
if (resultArea) {
resultArea.value = content;
addToHistory('世界书扩展', `类型:${typeDesc}`, content);
const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
if (copyBtn) copyBtn.disabled = false;
}
toastr.success('生成成功');
} catch (err) { toastr.error(`失败: ${err.message}`); }
finally { if (btn) { btn.disabled = false; btn.textContent = '生成扩展'; } }
}

// ========== 新增模板存储 ==========
let extraTemplates = {
    identity: '',
    relation: '',
    scene: '',
    gameplay_space: '',
    gameplay_power: '',
    gameplay_psychological: '',
    gameplay_plot: ''
};

function loadExtraTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_extra_templates`);
        if (saved) {
            extraTemplates = { ...extraTemplates, ...JSON.parse(saved) };
        }
    } catch(e) {}
}

function saveExtraTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_extra_templates`, JSON.stringify(extraTemplates));
    } catch(e) {}
}

// ========== 小说生成器 ==========
let novelTemplates = {
    systemPrompt: '你是一个小说创意生成器。根据用户的要求生成小说设定和章节内容。\n\n书名要求：2-8个字，有吸引力，符合题材。\n文案要求：150-300字，包含人设介绍和故事开端悬念，像小说封底简介。\n\n章节内容要求：\n- 严格按照用户要求的章数生成，每章{wordCount}字左右\n- 采用白描手法，只写发生了什么，不写情绪、不写氛围、不写心理活动\n- 每章包含：时间、地点、人物、行动、结果\n- 转折和伏笔可以有但不是必须，用事件来呈现，不要用解释性语言\n- 禁止使用：感到、觉得、仿佛、似乎、气氛、情绪、美丽、漂亮、动人\n- 字数达标靠足够的事件细节，不是靠形容词堆砌\n\n输出格式：\n书名：《xxx》\n文案：xxx\n\n章节列表：\n第1章\n[章节内容]\n\n第2章\n[章节内容]\n\n...\n\n必须生成完整的{chapterCount}章，每章之间用"第X章"分隔。',
    continuePrompt: '你正在续写小说《{title}》。\n前面已写完第1-{doneCount}章，以下是已有章节的内容：\n{chapters}\n\n请继续生成第{start}到第{end}章的内容。\n保持故事连贯，人物不OOC，每章{wordCount}字左右。\n采用白描手法，只写发生了什么。\n必须生成完整的{chapterCount}章。\n只输出新增的章节，格式：\n第X章\n[章节内容]\n\n不要重复已有内容，不要输出书名和文案。'
};

let currentNovel = {
    title: '',
    blurb: '',
    chapters: [],
    style: '',
    wordCount: 500
};

function loadNovelTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_novel_templates`);
        if (saved) {
            novelTemplates = { ...novelTemplates, ...JSON.parse(saved) };
        }
    } catch(e) {}
}

function saveNovelTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_novel_templates`, JSON.stringify(novelTemplates));
    } catch(e) {}
}

function saveCurrentNovel() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_current_novel`, JSON.stringify(currentNovel));
    } catch(e) {}
}

function loadCurrentNovel() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_current_novel`);
        if (saved) {
            currentNovel = JSON.parse(saved);
            displayNovel();
        }
    } catch(e) {}
}

function displayNovel() {
    const titleEl = document.getElementById('novel-title');
    const blurbEl = document.getElementById('novel-blurb');
    const chaptersContainer = document.getElementById('novel-chapters');
    
    if (titleEl) titleEl.textContent = currentNovel.title || '未生成';
    if (blurbEl) blurbEl.value = currentNovel.blurb || '';
    
    if (chaptersContainer) {
        if (currentNovel.chapters.length === 0) {
            chaptersContainer.innerHTML = '<div class="empty-state">暂无章节，请先生成小说</div>';
        } else {
            chaptersContainer.innerHTML = currentNovel.chapters.map((ch, idx) => `
                <div class="chapter-card">
                    <div class="chapter-title">第${idx+1}章</div>
                    <textarea class="chapter-content-textarea" readonly>${escapeHtml(ch.content)}</textarea>
                </div>
            `).join('');
        }
    }
}

async function generateNovel(isContinue = false) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    
    const userInput = document.getElementById('novel-user-input')?.value || '';
    const styleTags = document.getElementById('novel-style-tags')?.value || '';
    const wordCount = parseInt(document.getElementById('novel-word-count')?.value || '500');
    let chapterCount = parseInt(document.getElementById('novel-chapter-count')?.value || '5');
    
    if (wordCount < 300 || wordCount > 1000) {
        toastr.warning('章节字数请在300-1000之间');
        return;
    }
    if (chapterCount < 1 || chapterCount > 20) {
        toastr.warning('生成章数请在1-20之间');
        return;
    }
    
    let systemPrompt = novelTemplates.systemPrompt
        .replace(/\{wordCount\}/g, wordCount)
        .replace(/\{chapterCount\}/g, chapterCount);
    let userMessage = '';
    
    if (isContinue) {
        if (currentNovel.chapters.length === 0) {
            toastr.warning('没有已有小说，请先生成');
            return;
        }
        const existingChapters = currentNovel.chapters.map((ch, i) => `第${i+1}章\n${ch.content.substring(0, 200)}...`).join('\n\n');
        let continuePrompt = novelTemplates.continuePrompt;
        
        systemPrompt = continuePrompt
            .replace('{title}', currentNovel.title)
            .replace('{doneCount}', currentNovel.chapters.length)
            .replace('{chapters}', existingChapters)
            .replace('{start}', currentNovel.chapters.length + 1)
            .replace('{end}', currentNovel.chapters.length + chapterCount)
            .replace('{wordCount}', wordCount)
            .replace('{chapterCount}', chapterCount);
        
        userMessage = `请续写第${currentNovel.chapters.length+1}到第${currentNovel.chapters.length+chapterCount}章，共${chapterCount}章`;
    } else {
        let styleText = '';
        if (styleTags) {
            styleText = `风格标签：${styleTags}。请从这些标签中选择1-2个作为主要风格。`;
        }
        systemPrompt = systemPrompt + `\n\n${styleText}`;
        userMessage = userInput || '请随机生成一个有趣的小说设定';
    }
    
    const btn = isContinue ? document.getElementById('novel-continue') : document.getElementById('novel-generate');
    if (btn) { btn.disabled = true; btn.textContent = isContinue ? '续写中...' : '生成中...'; }
    
    try {
        const content = await callApi(
            [{ role: 'user', content: userMessage }],
            systemPrompt,
            { temperature: 0.85, max_tokens: 8000 }
        );
        
        if (!isContinue) {
            const titleMatch = content.match(/书名[：:]\s*《(.+?)》/);
            const blurbMatch = content.match(/文案[：:]\s*([\s\S]+?)(?=\n\n章节|$)/);
            
            currentNovel.title = titleMatch ? titleMatch[1] : '未命名';
            currentNovel.blurb = blurbMatch ? blurbMatch[1].trim() : '';
            currentNovel.wordCount = wordCount;
            currentNovel.style = styleTags;
            currentNovel.chapters = [];
            
            const chapterRegex = /第(\d+)章\s*\n([\s\S]+?)(?=\n第\d+章|$)/g;
            let match;
            let chaptersFound = [];
            while ((match = chapterRegex.exec(content)) !== null) {
                chaptersFound.push({ title: '', content: match[2].trim() });
            }
            
            if (chaptersFound.length === 0) {
                const lines = content.split('\n');
                let currentChapter = '';
                let inChapter = false;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].match(/第\d+章/)) {
                        if (currentChapter) {
                            chaptersFound.push({ title: '', content: currentChapter.trim() });
                        }
                        currentChapter = '';
                        inChapter = true;
                    } else if (inChapter) {
                        currentChapter += lines[i] + '\n';
                    }
                }
                if (currentChapter) {
                    chaptersFound.push({ title: '', content: currentChapter.trim() });
                }
            }
            
            currentNovel.chapters = chaptersFound;
            
            if (currentNovel.chapters.length < chapterCount) {
                toastr.warning(`只生成了${currentNovel.chapters.length}章，未达到${chapterCount}章，请重试`);
            }
            
            addToHistory('小说生成器', userInput || '随机生成', content);
        } else {
            const chapterRegex = /第(\d+)章\s*\n([\s\S]+?)(?=\n第\d+章|$)/g;
            let match;
            while ((match = chapterRegex.exec(content)) !== null) {
                currentNovel.chapters.push({ title: '', content: match[2].trim() });
            }
            addToHistory('小说生成器', `续写${chapterCount}章`, content);
        }
        
        saveCurrentNovel();
        displayNovel();
        toastr.success(isContinue ? '续写成功' : `生成成功，共${currentNovel.chapters.length}章`);
        
        const copyBtn = document.getElementById('novel-copy');
        if (copyBtn) copyBtn.disabled = false;
        
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = isContinue ? '续写' : '生成新小说'; }
    }
}

function clearNovel() {
    if (confirm('清空当前小说？所有未保存的章节将丢失。')) {
        currentNovel = { title: '', blurb: '', chapters: [], style: '', wordCount: 500 };
        saveCurrentNovel();
        displayNovel();
        toastr.success('已清空');
    }
}

function copyNovel() {
    let text = `书名：《${currentNovel.title}》\n\n文案：\n${currentNovel.blurb}\n\n章节内容：\n`;
    currentNovel.chapters.forEach((ch, i) => {
        text += `\n第${i+1}章\n${ch.content}\n`;
    });
    copyToClipboard(text);
}

// ========== 故事生成器 ==========
async function generateStory(btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    const userWish = document.getElementById('story-user-wish')?.value || '';
    const count = parseInt(document.getElementById('story-count')?.value || '3');
    if (isNaN(count) || count < 1 || count > 20) {
        toastr.warning('数量请在1-20之间');
        return;
    }
    
    const systemPrompt = `你是一个故事创意生成器。请根据用户的要求生成 ${count} 个不同的故事设定。

身份库：${extraTemplates.identity || '（用户未填写，请根据常识补充）'}
关系库：${extraTemplates.relation || '（用户未填写，请根据常识补充）'}
场景库：${extraTemplates.scene || '（用户未填写，请根据常识补充）'}
空间环境玩法：${extraTemplates.gameplay_space || '（用户未填写）'}
权力动态玩法：${extraTemplates.gameplay_power || '（用户未填写）'}
心理情境玩法：${extraTemplates.gameplay_psychological || '（用户未填写）'}
剧情玩法：${extraTemplates.gameplay_plot || '（用户未填写）'}

用户要求：${userWish || '无具体要求，请随机生成'}

生成规则：
1. 每个故事包含：身份A、身份B、关系性质、场景、玩法组合（3-6个标签）
2. 输出格式：
【故事1】
身份A：xxx
身份B：xxx
关系：xxx
场景：xxx
玩法：标签1 + 标签2 + 标签3
---
3. 禁止多余形容词，只写干货
4. 如果用户有要求，必须满足用户要求
5. 如果用户模板为空，请根据常识补充`;

    if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: `请生成 ${count} 个不同的故事设定，要求：${userWish || '随机'}` }],
            systemPrompt,
            { temperature: 0.85, max_tokens: 4000 }
        );
        if (resultArea) {
            resultArea.value = content;
            addToHistory('故事生成器', userWish || '随机', content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success(`生成 ${count} 个故事成功`);
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '批量生成故事'; }
    }
}

// ========== 玩法生成器 ==========
async function generatePlayMix(btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    
    const userWish = document.getElementById('playmix-user-wish')?.value || '';
    const groupCount = parseInt(document.getElementById('playmix-group-count')?.value || '1');
    if (isNaN(groupCount) || groupCount < 1 || groupCount > 20) {
        toastr.warning('组数请在1-20之间');
        return;
    }
    
    const systemPrompt = `你是一个创意标签生成器。请根据用户的要求生成 ${groupCount} 组人设和玩法组合，每组包含10个人设和10组玩法。

用户要求：${userWish || '无具体要求，请随机生成'}

生成规则：
1. 人设格式：A x B（例如：破产少爷 x 腹黑大小姐）
2. 玩法格式：2-5个标签用" + "连接（例如：户外 + 轻SM + 指令服从）
3. 人设和玩法完全独立，不需要关联
4. 禁止多余形容词，只输出标签
5. 每组输出格式：
=== 第N组 ===
【人设十组】
1. xxx x xxx
2. xxx x xxx
...
10. xxx x xxx

【玩法十组】
1. xxx + xxx
2. xxx + xxx
...
10. xxx + xxx

6. 可以自由发挥，不限于常见组合
7. 不同组之间要有差异，不要重复
8. 如果用户有要求，必须满足用户要求`;

    if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: `请生成 ${groupCount} 组不同的人设和玩法，要求：${userWish || '随机'}` }],
            systemPrompt,
            { temperature: 0.9, max_tokens: 4000 }
        );
        if (resultArea) {
            resultArea.value = content;
            addToHistory('玩法生成器', userWish || '随机', content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success(`生成 ${groupCount} 组成功`);
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '生成人设+玩法'; }
    }
}

// ========== 小剧场生成器 ==========
let theaterTemplates = {
    systemPrompt: '你是一个小剧场/番外剧情生成器。根据用户的关键词（或随机生成）生成小剧场设定。\n\n输出格式要求：\n每个小剧场以"现在立即停止正文输出，仅输出以下番外："开头，然后是具体的剧情设定描述，最后以"不少于3000字。"结尾。\n\n示例：\n现在立即停止正文输出，仅输出以下番外：{{user}}因为一场意外穿越到古代，成为了{{char}}的丫鬟，{{user}}以为自己隐藏得很好，却不知道{{char}}早就看穿了她的身份...不少于3000字。\n\n生成规则：\n1. 剧情要完整，包含起因、冲突、悬念\n2. 使用{{user}}和{{char}}作为角色占位符\n3. 不要多余形容词，只写核心剧情\n4. 如果用户提供了关键词，必须融入关键词\n5. 不同小剧场之间要有明显差异'
};

function loadTheaterTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_theater_templates`);
        if (saved) {
            theaterTemplates = { ...theaterTemplates, ...JSON.parse(saved) };
        }
    } catch(e) {}
}

function saveTheaterTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_theater_templates`, JSON.stringify(theaterTemplates));
    } catch(e) {}
}

async function generateTheater(btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    
    const keywords = document.getElementById('theater-keywords')?.value || '';
    const count = parseInt(document.getElementById('theater-count')?.value || '3');
    if (isNaN(count) || count < 1 || count > 20) {
        toastr.warning('数量请在1-20之间');
        return;
    }
    
    let systemPrompt = theaterTemplates.systemPrompt;
    let userMessage = keywords ? `请根据以下关键词生成 ${count} 个小剧场：${keywords}` : `请随机生成 ${count} 个小剧场`;
    
    if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: userMessage }],
            systemPrompt,
            { temperature: 0.85, max_tokens: 4000 }
        );
        
        let lines = content.split('\n');
        let result = '';
        let theaterIndex = 1;
        let currentTheater = '';
        
        for (let line of lines) {
            if (line.includes('现在立即停止正文输出')) {
                if (currentTheater) {
                    result += `【小剧场${theaterIndex}】\n${currentTheater.trim()}\n---\n`;
                    theaterIndex++;
                    currentTheater = '';
                }
                currentTheater = line + '\n';
            } else if (currentTheater) {
                currentTheater += line + '\n';
            } else if (line.trim()) {
                if (!result && theaterIndex === 1) {
                    result += `【小剧场${theaterIndex}】\n${line}\n---\n`;
                    theaterIndex++;
                }
            }
        }
        if (currentTheater) {
            result += `【小剧场${theaterIndex}】\n${currentTheater.trim()}\n---\n`;
        }
        
        if (resultArea) {
            resultArea.value = result || content;
            addToHistory('小剧场生成器', keywords || '随机生成', result || content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success(`生成 ${count} 个小剧场成功`);
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '生成小剧场'; }
    }
}

// ========== 心理学分析 ==========
let psychologyTemplates = {
    analysisPrompt: `你是一位专业的心理学分析师。根据用户提供的人设或剧情，进行深入的人格心理分析。

请按照以下维度输出分析报告：

一、核心人格特质（大五模型）
- 开放性：X/10 - [描述]
- 尽责性：X/10 - [描述]
- 外向性：X/10 - [描述]
- 宜人性：X/10 - [描述]
- 神经质：X/10 - [描述]

二、依恋类型
- 类型：[安全型/焦虑型/回避型/恐惧型]
- 表现：[具体行为表现]
- 成因推测：[基于成长经历的分析]

三、心理防御机制
- 主要防御机制：[最常用的]
- 次要防御机制：[次常用的]
- 成熟/不成熟比例：[X%/X%]

四、认知行为模式
- 核心信念：[如"我不可爱""世界是危险的"]
- 自动思维倾向：[在特定情境下的自动反应]
- 典型应对策略：[如何应对压力和挫折]

五、动机与价值观
- 内在驱动：[从内心出发的动力]
- 外在驱动：[外界影响的动力]
- 价值排序：[最重要的3-5个价值观]

六、人际关系模式
- 互动风格：[主动/被动/控制/顺从等]
- 边界感：[僵硬/健康/模糊]
- 信任倾向：[易信/多疑/选择信任]

七、情绪调节能力
- 识别能力：[能否准确识别自己和他人的情绪]
- 表达能力：[能否适当表达情绪]
- 管理能力：[能否有效调节情绪]

八、阴影面/潜在冲突
- 荣格阴影：[被压抑或否认的部分]
- 未被接纳的部分：[自我排斥的特质]
- 内心矛盾：[最核心的冲突]

九、成长方向与建议
- 疗愈路径：[可能的疗愈方向]
- 发展潜力：[可发展的优势]
- 具体建议：[3-5条可操作建议]

十、核心恐惧
这个人最害怕的是什么？（不是表面的，是深层的）

十一、隐藏渴望
这个人最想要但不敢承认的是什么？

十二、防御机制具体化
- 被批评时：[具体会怎么做]
- 失败时：[具体会怎么做]
- 被拒绝时：[具体会怎么做]

十三、梦境倾向
最可能做什么类型的梦？

十四、压力反应模式
- 轻度压力下：[反应]
- 中度压力下：[反应]
- 重度压力下：[反应]

十五、冲突处理方式
战/逃/僵/讨好：主要用哪个？次要用哪个？

十六、容易被谁吸引
什么样的人会让他心动/想靠近？

十七、会让谁反感
什么样的人会让他讨厌/想远离？

十八、友情模式
交朋友的方式和维护友谊的方式

十九、亲密关系隐患
在恋爱/婚姻中最可能出问题的点

二十、核心信念（细化）
- 关于自己的一条信念
- 关于他人的一条信念
- 关于世界的一条信念

二十一、认知偏差
最明显的2-3个认知偏差（如：非黑即白、灾难化、读心术）

二十二、自我对话方式
内心独白的语气和内容特点

二十三、象征映射
- 像什么动物：[动物] - [理由]
- 像什么颜色：[颜色] - [理由]
- 像什么季节/天气：[季节/天气] - [理由]

二十四、适合vs不适合
- 适合的职业（3个）
- 不适合的职业（3个）
- 适合的伴侣类型
- 不适合的伴侣类型

二十五、人生剧本
潜意识里在重复什么模式？

二十六、未完成的课题
从发展心理学看，哪个阶段的课题没完成？

二十七、潜在优势
未被自己发现的3个优势

二十八、成长路径
如果他想变好，第一步应该做什么？

注意：基于提供的材料进行分析推断，不要凭空捏造。如果信息不足，请标注"信息不足，推测为"。`,
    mbtiPrompt: `你是一位MBTI人格分析专家。根据用户提供的角色设定，分析该角色的MBTI类型。

【表达风格指导】
- 强势/主导型角色：用“果断、掌控、主导、引领”等词
- 温和/随性型角色：用“随和、适应、灵活、开放”等词
- 敏感/内向型角色：用“细腻、内省、谨慎、温和”等词
- 热情/外向型角色：用“活跃、热情、感染、带动”等词
- 理性/分析型角色：用“逻辑、分析、客观、条理”等词
- 感性/情感型角色：用“共情、感受、体谅、温暖”等词

【禁止过度渲染】
- 不要用“猎物”“征服”“沉沦”“沦陷”“占有”等极端词，除非人设明确属于极端控制/极端服从类型
- 不要用“油腻”“甜腻”“宠溺”等过度情感化词汇
- 保持分析的专业性和客观性，用描述性语言而非戏剧化语言

角色设定：{character}

请输出：
【MBTI分析】
各维度倾向：
- 外向(E) vs 内向(I)：[倾向] - [理由]
- 感觉(S) vs 直觉(N)：[倾向] - [理由]
- 思考(T) vs 情感(F)：[倾向] - [理由]
- 判断(J) vs 感知(P)：[倾向] - [理由]

MBTI类型：[四个字母]
类型解析：[用描述性语言解释这个类型如何体现在角色身上]`
};

function loadPsychologyTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_psychology_templates`);
        if (saved) {
            psychologyTemplates = { ...psychologyTemplates, ...JSON.parse(saved) };
        }
    } catch(e) {}
}

function savePsychologyTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_psychology_templates`, JSON.stringify(psychologyTemplates));
    } catch(e) {}
}

async function generatePsychologyAnalysis(btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    
    const userInput = document.getElementById('psychology-input')?.value;
    if (!userInput || !userInput.trim()) {
        toastr.warning('请输入要分析的人设或剧情');
        return;
    }
    
    const systemPrompt = psychologyTemplates.analysisPrompt;
    
    if (btn) { btn.disabled = true; btn.textContent = '分析中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: `请分析以下角色/剧情：\n${userInput}` }],
            systemPrompt,
            { temperature: 0.7, max_tokens: 6000 }
        );
        if (resultArea) {
            resultArea.value = content;
            addToHistory('心理分析', userInput.substring(0, 80), content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success('分析完成');
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '生成分析报告'; }
    }
}

async function generateMBTITest(btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    
    const character = document.getElementById('mbti-character-input')?.value;
    if (!character || !character.trim()) {
        toastr.warning('请输入要测试的角色设定');
        return;
    }
    
    let systemPrompt = psychologyTemplates.mbtiPrompt.replace('{character}', character);
    
    if (btn) { btn.disabled = true; btn.textContent = '分析中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: `请分析以下角色的MBTI类型：\n${character}` }],
            systemPrompt,
            { temperature: 0.6, max_tokens: 2000 }
        );
        if (resultArea) {
            resultArea.value = content;
            addToHistory('MBTI分析', character.substring(0, 80), content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success('分析完成');
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '分析MBTI'; }
    }
}

// ========== 文风生成 ==========
let styleGenTemplates = {
    systemPrompt: `你是一位文学风格分析师。根据用户提供的内容（文字片段、关键词或作家名），生成详细的文风设定档案。

输出格式必须严格遵循以下模板，每个模块写2-4句话，不要只写一句话。

【文风名称】：[给这种风格起一个名字]

## Core Essence
[一句话核心精髓 + 展开描述这种风格的本质特征]

## Core Elements
- [元素1]：详细描述
- [元素2]：详细描述
- [元素3]：详细描述
- [元素4]：详细描述
- [元素5]：详细描述

## Tone & Rhythm
[语调是冷峻/温暖/幽默/严肃/诗意？节奏是快/慢/张弛有度/跳跃？]

## Sentence Patterns
[句式偏好：长句还是短句？复杂从句还是简单句？标点使用习惯？]

## Word Preferences
[用词偏好：喜欢具象词还是抽象词？是否有标志性词汇？避免什么词？]

## Perspective
[人称视角：第一/第二/第三人称？有限/全知/客观？是否频繁切换？]

## Dialogue Guidelines
[对话是自然口语还是精炼台词？是否带方言/口癖？对话占比？]

## Atmospheric Tendencies
[氛围倾向：压抑/明亮/潮湿/干燥/梦幻/写实？感官细节侧重？]

## Behavioral Principles
[角色行为描写：通过动作还是心理？细节多还是留白多？]

## Emotional Intensity
[情感浓度：1-10分。情绪外放还是内敛？是否克制？]

## Stylistic Techniques
- [技巧1]：具体说明
- [技巧2]：具体说明
- [技巧3]：具体说明
- [技巧4]：具体说明

## Binding Sentence
[一句话总结，像文学评论的结语]

---

【English Version】

## Style Name: [English name]

## Core Essence
[English description]

## Core Elements
- [Element 1]: description
- [Element 2]: description
- [Element 3]: description
- [Element 4]: description
- [Element 5]: description

## Tone & Rhythm
[English description]

## Sentence Patterns
[English description]

## Word Preferences
[English description]

## Perspective
[English description]

## Dialogue Guidelines
[English description]

## Atmospheric Tendencies
[English description]

## Behavioral Principles
[English description]

## Emotional Intensity
[1-10 scale + description]

## Stylistic Techniques
- [Technique 1]
- [Technique 2]
- [Technique 3]
- [Technique 4]

## Binding Sentence
[English closing]

生成规则：
1. 如果用户提供的是文字片段，从中分析提取风格特征
2. 如果用户提供的是关键词，根据关键词创造一种合理的文风
3. 如果用户提供的是作家名，根据该作家的已知写作风格生成文风档案
4. 每个文风档案要独特、有辨识度
5. 不要复制用户原文，只输出分析结果
6. 要用具体的写作技巧术语来描述文风
7. 英文版用词要精准、句式清晰，便于AI理解，不要逐字直译`
};

function loadStyleGenTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_stylegen_templates`);
        if (saved) {
            styleGenTemplates = { ...styleGenTemplates, ...JSON.parse(saved) };
        }
    } catch(e) {}
}

function saveStyleGenTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_stylegen_templates`, JSON.stringify(styleGenTemplates));
    } catch(e) {}
}

async function generateStyle(btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    
    const mode = document.querySelector('input[name="style-mode"]:checked')?.value || 'analyze';
    const userInput = document.getElementById('style-input')?.value;
    const count = parseInt(document.getElementById('style-count')?.value || '1');
    
    if (!userInput || !userInput.trim()) {
        toastr.warning('请输入文字片段或关键词或作家名');
        return;
    }
    if (isNaN(count) || count < 1 || count > 20) {
        toastr.warning('数量请在1-20之间');
        return;
    }
    
    let systemPrompt = styleGenTemplates.systemPrompt;
    let userMessage = '';
    
    if (mode === 'analyze') {
        userMessage = `请分析以下文字片段，生成 ${count} 个不同的文风档案：\n\n${userInput}`;
    } else {
        userMessage = `请根据以下内容（关键词或作家名），生成 ${count} 个不同的文风档案：\n\n${userInput}`;
    }
    
    if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: userMessage }],
            systemPrompt,
            { temperature: 0.85, max_tokens: 8000 }
        );
        
        let lines = content.split('\n');
        let result = '';
        let styleIndex = 1;
        let currentStyle = '';
        let inStyle = false;
        
        for (let line of lines) {
            if (line.trim().startsWith('【文风名称】') || line.trim().startsWith('## Core Essence')) {
                if (currentStyle && inStyle) {
                    result += `【文风${styleIndex}】\n${currentStyle.trim()}\n---\n`;
                    styleIndex++;
                    currentStyle = '';
                }
                inStyle = true;
                currentStyle += line + '\n';
            } else if (inStyle) {
                currentStyle += line + '\n';
            }
        }
        if (currentStyle && inStyle) {
            result += `【文风${styleIndex}】\n${currentStyle.trim()}\n---\n`;
        }
        
        if (resultArea) {
            resultArea.value = result || content;
            addToHistory('文风生成', userInput.substring(0, 80), result || content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success(`生成 ${count} 个文风成功`);
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '生成文风'; }
    }
}

// ========== 预设生成 ==========
let presetGenTemplates = {
    systemPrompt: `你是一个指令/预设生成器。用户会输入一些关键词，你需要根据这些关键词生成一套可用于SillyTavern预设的指令描述。

【生成逻辑】
1. 先理解用户关键词的核心意图
2. 将核心意图拆解成3-5个可执行的具体方向
3. 每个方向写成一条明确的指令，用“- ”开头
4. 指令要具体、可操作，不要抽象描述
5. 不要写剧情、不要写故事、不要写例子

【输出格式】
【指令名称】：[根据关键词生成]

## 核心方向
[一句话概括]

## 具体细则
- [指令1]
- [指令2]
- [指令3]
- [指令4]

## 执行注意
- [注意1]
- [注意2]`
};

function loadPresetGenTemplates() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_presetgen_templates`);
        if (saved) {
            presetGenTemplates = { ...presetGenTemplates, ...JSON.parse(saved) };
        }
    } catch(e) {}
}

function savePresetGenTemplates() {
    try {
        localStorage.setItem(`${EXTENSION_NAME}_presetgen_templates`, JSON.stringify(presetGenTemplates));
    } catch(e) {}
}

async function generatePreset(btn, resultArea) {
    if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
        toastr.error('请先配置 API');
        return;
    }
    
    const userInput = document.getElementById('preset-input')?.value;
    const count = parseInt(document.getElementById('preset-count')?.value || '1');
    
    if (!userInput || !userInput.trim()) {
        toastr.warning('请输入关键词');
        return;
    }
    if (isNaN(count) || count < 1 || count > 20) {
        toastr.warning('数量请在1-20之间');
        return;
    }
    
    let systemPrompt = presetGenTemplates.systemPrompt;
    let userMessage = `请根据以下关键词生成 ${count} 个预设指令：\n\n${userInput}`;
    
    if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: userMessage }],
            systemPrompt,
            { temperature: 0.85, max_tokens: 4000 }
        );
        
        let lines = content.split('\n');
        let result = '';
        let presetIndex = 1;
        let currentPreset = '';
        let inPreset = false;
        
        for (let line of lines) {
            if (line.trim().startsWith('【指令名称】')) {
                if (currentPreset && inPreset) {
                    result += `【预设${presetIndex}】\n${currentPreset.trim()}\n---\n`;
                    presetIndex++;
                    currentPreset = '';
                }
                inPreset = true;
                currentPreset += line + '\n';
            } else if (inPreset) {
                currentPreset += line + '\n';
            }
        }
        if (currentPreset && inPreset) {
            result += `【预设${presetIndex}】\n${currentPreset.trim()}\n---\n`;
        }
        
        if (resultArea) {
            resultArea.value = result || content;
            addToHistory('预设生成', userInput.substring(0, 80), result || content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success(`生成 ${count} 个预设成功`);
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '生成预设'; }
    }
}

// ========== 自定义页面管理器 ==========
let editingPageId = null;

function renderCustomPagesManager() {
    let html = `
        <div class="custom-page-editor">
            <div class="custom-page-form">
                <h4>${editingPageId ? '编辑自定义页面' : '新建自定义页面'}</h4>
                <div class="field">
                    <label>页面名称</label>
                    <input type="text" id="custom-page-name" placeholder="例如：我的生成器">
                </div>
                <div class="field">
                    <label>子模式配置（可添加多个，每个子模式对应一个模板）</label>
                    <div id="custom-submodes-container"></div>
                    <button id="add-submode-row" type="button" class="menu_button">+ 添加子模式</button>
                </div>
                <div class="field">
                    <label>公共输入框配置（可选，所有子模式共用）</label>
                    <div id="custom-inputs-container"></div>
                    <button id="add-input-row" type="button" class="menu_button">+ 添加输入框</button>
                </div>
                <div class="field">
                    <label>显示生成数量滑块</label>
                    <select id="custom-show-count">
                        <option value="true">是</option>
                        <option value="false">否</option>
                    </select>
                </div>
                <div class="button-group">
                    <button id="save-custom-page" class="primary-btn">保存页面</button>
                    ${editingPageId ? '<button id="cancel-edit-page" class="menu_button">取消编辑</button>' : ''}
                </div>
            </div>
            <div class="custom-page-list">
                <h4>已有页面</h4>
                <div id="custom-pages-list"></div>
            </div>
        </div>
    `;
    return html;
}

function addSubmodeRowToForm(name = '', id = '') {
    const container = document.getElementById('custom-submodes-container');
    const idx = container.children.length;
    const rowHtml = `
        <div class="custom-submode-row" data-idx="${idx}">
            <input type="text" class="submode-id" placeholder="子模式标识(如structured)" value="${escapeHtml(id || 'submode'+(idx+1))}" style="width: 150px;">
            <input type="text" class="submode-name" placeholder="显示名称" value="${escapeHtml(name || '子模式'+(idx+1))}" style="width: 150px;">
            <button class="remove-submode-row">删除</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
    container.lastElementChild.querySelector('.remove-submode-row').onclick = function() {
        this.closest('.custom-submode-row').remove();
    };
}

function addInputRowToForm(id = '', label = '', type = 'textarea', placeholder = '') {
    const container = document.getElementById('custom-inputs-container');
    const idx = container.children.length;
    const rowHtml = `
        <div class="custom-input-row" data-idx="${idx}">
            <input type="text" class="input-id" placeholder="变量名" value="${escapeHtml(id || 'input'+(idx+1))}" style="width: 120px;">
            <input type="text" class="input-label" placeholder="显示标签" value="${escapeHtml(label || '输入框'+(idx+1))}" style="width: 120px;">
            <select class="input-type">
                <option value="textarea" ${type === 'textarea' ? 'selected' : ''}>多行文本</option>
                <option value="text" ${type === 'text' ? 'selected' : ''}>单行文本</option>
                <option value="number" ${type === 'number' ? 'selected' : ''}>数字</option>
                <option value="range" ${type === 'range' ? 'selected' : ''}>滑块</option>
            </select>
            <input type="text" class="input-placeholder" placeholder="占位提示" value="${escapeHtml(placeholder || '')}" style="width: 150px;">
            <button class="remove-input-row">删除</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
    container.lastElementChild.querySelector('.remove-input-row').onclick = function() {
        this.closest('.custom-input-row').remove();
    };
}

function refreshCustomPagesUI() {
    const container = document.getElementById('custom-pages-list');
    if (!container) return;
    
    if (customPages.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无自定义页面，点击上方按钮创建</div>';
    } else {
        container.innerHTML = customPages.map((page, idx) => `
            <div class="custom-page-item" data-id="${page.id}">
                <div class="custom-page-info">
                    <span class="custom-page-name">${escapeHtml(page.name)}</span>
                    <span class="custom-page-status ${page.enabled ? 'enabled' : 'disabled'}">${page.enabled ? '启用' : '禁用'}</span>
                </div>
                <div class="custom-page-actions">
                    <button class="edit-custom-page" data-id="${page.id}">编辑</button>
                    <button class="toggle-custom-page" data-id="${page.id}">${page.enabled ? '禁用' : '启用'}</button>
                    <button class="delete-custom-page" data-id="${page.id}">删除</button>
                </div>
            </div>
        `).join('');
    }
    
    document.querySelectorAll('.edit-custom-page').forEach(btn => {
        btn.onclick = () => {
            const page = customPages.find(p => p.id === btn.dataset.id);
            if (page) loadPageToForm(page);
        };
    });
    
    document.querySelectorAll('.toggle-custom-page').forEach(btn => {
        btn.onclick = () => {
            const page = customPages.find(p => p.id === btn.dataset.id);
            if (page) {
                page.enabled = !page.enabled;
                saveCustomPages();
                refreshCustomPagesUI();
                rebuildTabsAndContents();
                refreshTemplateEditor();
                toastr.success(`${page.name} ${page.enabled ? '已启用' : '已禁用'}`);
            }
        };
    });
    
    document.querySelectorAll('.delete-custom-page').forEach(btn => {
        btn.onclick = () => {
            if (confirm('确定删除此页面吗？')) {
                const idx = customPages.findIndex(p => p.id === btn.dataset.id);
                if (idx !== -1) {
                    customPages.splice(idx, 1);
                    saveCustomPages();
                    refreshCustomPagesUI();
                    rebuildTabsAndContents();
                    refreshTemplateEditor();
                    toastr.success('已删除');
                    if (editingPageId === btn.dataset.id) {
                        clearForm();
                    }
                }
            }
        };
    });
}

function loadPageToForm(page) {
    editingPageId = page.id;
    document.getElementById('custom-page-name').value = page.name;
    document.getElementById('custom-show-count').value = page.showCount !== false ? 'true' : 'false';
    
    const submodeContainer = document.getElementById('custom-submodes-container');
    submodeContainer.innerHTML = '';
    (page.submodes || []).forEach((submode, idx) => {
        addSubmodeRowToForm(submode.name, submode.id);
    });
    
    const inputContainer = document.getElementById('custom-inputs-container');
    inputContainer.innerHTML = '';
    (page.inputs || []).forEach((input, idx) => {
        addInputRowToForm(input.id, input.label, input.type, input.placeholder);
    });
    
    const formTitle = document.querySelector('.custom-page-form h4');
    if (formTitle) formTitle.textContent = '编辑自定义页面';
    
    const btnGroup = document.querySelector('.custom-page-form .button-group');
    if (btnGroup && !document.getElementById('cancel-edit-page')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-page';
        cancelBtn.className = 'menu_button';
        cancelBtn.textContent = '取消编辑';
        cancelBtn.onclick = () => clearForm();
        btnGroup.appendChild(cancelBtn);
    }
}

function clearForm() {
    editingPageId = null;
    document.getElementById('custom-page-name').value = '';
    document.getElementById('custom-show-count').value = 'true';
    document.getElementById('custom-submodes-container').innerHTML = '';
    document.getElementById('custom-inputs-container').innerHTML = '';
    
    const formTitle = document.querySelector('.custom-page-form h4');
    if (formTitle) formTitle.textContent = '新建自定义页面';
    
    const cancelBtn = document.getElementById('cancel-edit-page');
    if (cancelBtn) cancelBtn.remove();
}

function bindCustomPageManagerEvents() {
    const addSubmodeBtn = document.getElementById('add-submode-row');
    if (addSubmodeBtn) {
        addSubmodeBtn.onclick = () => addSubmodeRowToForm();
    }
    
    const addInputBtn = document.getElementById('add-input-row');
    if (addInputBtn) {
        addInputBtn.onclick = () => addInputRowToForm();
    }
    
    const saveBtn = document.getElementById('save-custom-page');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const name = document.getElementById('custom-page-name').value.trim();
            if (!name) {
                toastr.warning('请输入页面名称');
                return;
            }
            
            const submodeRows = document.querySelectorAll('#custom-submodes-container .custom-submode-row');
            const submodes = [];
            submodeRows.forEach((row) => {
                const id = row.querySelector('.submode-id').value.trim();
                const displayName = row.querySelector('.submode-name').value.trim();
                if (id && displayName) {
                    submodes.push({ id: id, name: displayName });
                }
            });
            
            if (submodes.length === 0) {
                toastr.warning('请至少添加一个子模式');
                return;
            }
            
            const inputRows = document.querySelectorAll('#custom-inputs-container .custom-input-row');
            const inputs = [];
            inputRows.forEach((row) => {
                const id = row.querySelector('.input-id').value.trim();
                if (!id) return;
                inputs.push({
                    id: id,
                    label: row.querySelector('.input-label').value.trim() || id,
                    type: row.querySelector('.input-type').value,
                    placeholder: row.querySelector('.input-placeholder').value || ''
                });
            });
            
            const showCount = document.getElementById('custom-show-count').value === 'true';
            
            if (editingPageId) {
                const page = customPages.find(p => p.id === editingPageId);
                if (page) {
                    page.name = name;
                    page.submodes = submodes;
                    page.inputs = inputs;
                    page.showCount = showCount;
                    saveCustomPages();
                    toastr.success('页面已更新');
                }
                clearForm();
            } else {
                const newPage = {
                    id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
                    name: name,
                    enabled: true,
                    submodes: submodes,
                    inputs: inputs,
                    showCount: showCount
                };
                customPages.push(newPage);
                saveCustomPages();
                toastr.success('页面已创建');
                clearForm();
            }
            
            refreshCustomPagesUI();
            rebuildTabsAndContents();
            refreshTemplateEditor();
        };
    }
}

function getCustomPageTemplate(pageName, submodeId) {
    const templateKey = `custom_${pageName}_${submodeId}`;
    return customTemplates[templateKey] || '';
}

function saveCustomPageTemplate(pageName, submodeId, content) {
    const templateKey = `custom_${pageName}_${submodeId}`;
    customTemplates[templateKey] = content;
    saveCustomTemplates();
}

function renderCustomPageContent(page) {
    if (!page.enabled) return '';
    
    let submodeHtml = '';
    if (page.submodes && page.submodes.length > 0) {
        submodeHtml = `<div class="field"><label>子模式</label><div class="radio-group" id="custom_submode_group_${page.id}">`;
        page.submodes.forEach((submode, idx) => {
            submodeHtml += `<label><input type="radio" name="custom_submode_${page.id}" value="${escapeHtml(submode.id)}" ${idx === 0 ? 'checked' : ''}> ${escapeHtml(submode.name)}</label>`;
        });
        submodeHtml += `</div></div>`;
    }
    
    let inputsHtml = '';
    for (const input of page.inputs) {
        if (input.type === 'textarea') {
            inputsHtml += `
                <div class="field">
                    <label>${escapeHtml(input.label)}</label>
                    <textarea id="custom_input_${page.id}_${input.id}" rows="3" placeholder="${escapeHtml(input.placeholder || '')}"></textarea>
                </div>
            `;
        } else if (input.type === 'number') {
            inputsHtml += `
                <div class="field">
                    <label>${escapeHtml(input.label)}</label>
                    <input type="number" id="custom_input_${page.id}_${input.id}" placeholder="${escapeHtml(input.placeholder || '')}">
                </div>
            `;
        } else if (input.type === 'range') {
            inputsHtml += `
                <div class="field">
                    <label>${escapeHtml(input.label)}</label>
                    <input type="range" id="custom_input_${page.id}_${input.id}" min="1" max="20" value="1">
                    <span id="custom_input_${page.id}_${input.id}_val">1</span>
                </div>
            `;
        } else {
            inputsHtml += `
                <div class="field">
                    <label>${escapeHtml(input.label)}</label>
                    <input type="text" id="custom_input_${page.id}_${input.id}" placeholder="${escapeHtml(input.placeholder || '')}">
                </div>
            `;
        }
    }
    
    let countHtml = '';
    if (page.showCount !== false) {
        countHtml = `
            <div class="field">
                <label>生成数量</label>
                <input type="number" id="custom_count_${page.id}" min="1" max="20" value="1">
            </div>
        `;
    }
    
    return `
        <div class="custom-page-content" data-page-id="${page.id}">
            ${submodeHtml}
            ${inputsHtml}
            ${countHtml}
            <button id="custom_page_gen_${page.id}" class="primary-btn">生成</button>
            <div class="field"><label>生成结果</label><textarea id="custom_page_result_${page.id}" class="result-text" rows="12"></textarea></div>
            <div class="button-group"><button id="custom_page_copy_${page.id}" class="copy-btn">复制</button><button id="custom_page_clear_${page.id}">清空</button></div>
        </div>
    `;
}

function bindCustomPageEvents(pageId) {
    const genBtn = document.getElementById(`custom_page_gen_${pageId}`);
    const resultArea = document.getElementById(`custom_page_result_${pageId}`);
    const copyBtn = document.getElementById(`custom_page_copy_${pageId}`);
    const clearBtn = document.getElementById(`custom_page_clear_${pageId}`);
    
    if (!genBtn) return;
    
    const page = customPages.find(p => p.id === pageId);
    if (page) {
        for (const input of page.inputs) {
            if (input.type === 'range') {
                const slider = document.getElementById(`custom_input_${pageId}_${input.id}`);
                const valSpan = document.getElementById(`custom_input_${pageId}_${input.id}_val`);
                if (slider && valSpan) {
                    slider.oninput = () => { valSpan.textContent = slider.value; };
                }
            }
        }
    }
    
    genBtn.onclick = async () => {
        if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
            toastr.error('请先配置 API');
            return;
        }
        
        const page = customPages.find(p => p.id === pageId);
        if (!page) return;
        
        const selectedSubmode = document.querySelector(`input[name="custom_submode_${pageId}"]:checked`)?.value;
        if (!selectedSubmode) {
            toastr.warning('请选择一个子模式');
            return;
        }
        
        const template = getCustomPageTemplate(page.name, selectedSubmode);
        if (!template || !template.trim()) {
            toastr.warning(`请先在模板编辑页填写【自定义-${page.name}-${selectedSubmode}】提示词`);
            return;
        }
        
        let systemPrompt = template;
        
        const variables = {};
        for (const input of page.inputs) {
            const el = document.getElementById(`custom_input_${pageId}_${input.id}`);
            if (el) {
                let value = el.value;
                if (input.type === 'range') {
                    value = el.value;
                }
                variables[input.id] = value || '';
            }
        }
        
        const countEl = document.getElementById(`custom_count_${pageId}`);
        if (countEl) {
            variables['count'] = countEl.value;
        } else {
            variables['count'] = '1';
        }
        
        variables['submode'] = selectedSubmode;
        
        for (const [key, value] of Object.entries(variables)) {
            systemPrompt = systemPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }
        
        if (genBtn) { genBtn.disabled = true; genBtn.textContent = '生成中...'; }
        try {
            const content = await callApi(
                [{ role: 'user', content: '请根据用户要求生成内容' }],
                systemPrompt,
                { temperature: 0.85, max_tokens: 4000 }
            );
            if (resultArea) {
                resultArea.value = content;
                addToHistory(page.name, `子模式:${selectedSubmode}`, content);
                if (copyBtn) copyBtn.disabled = false;
            }
            toastr.success('生成成功');
        } catch(err) {
            toastr.error(`失败: ${err.message}`);
        } finally {
            if (genBtn) { genBtn.disabled = false; genBtn.textContent = '生成'; }
        }
    };
    
    if (copyBtn) copyBtn.onclick = () => copyToClipboard(resultArea?.value || '');
    if (clearBtn) clearBtn.onclick = () => { if(resultArea) resultArea.value = ''; if(copyBtn) copyBtn.disabled = true; };
    if(resultArea) resultArea.addEventListener('input', () => { if(copyBtn) copyBtn.disabled = !resultArea.value; saveDraft(`custom_${pageId}`, resultArea.value); });
    if(resultArea) resultArea.value = loadDraft(`custom_${pageId}`);
}

// ========== 选项卡管理器实现 ==========
function rebuildTabsAndContents() {
    const activeTabs = getActiveTabs();
    const hiddenTabs = Object.keys(builtInTabs).filter(id => !activeTabs.includes(id));
    
    // 重新渲染选项卡栏
    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) {
        tabBar.innerHTML = '';
        
        // 添加激活的内置选项卡
        for (const tabId of activeTabs) {
            if (builtInTabs[tabId]) {
                const btn = document.createElement('button');
                btn.className = 'tab-btn';
                btn.textContent = builtInTabs[tabId];
                btn.dataset.tab = tabId;
                tabBar.appendChild(btn);
            }
        }
        
        // 添加激活的自定义页面
        const enabledCustomPages = customPages.filter(p => p.enabled);
        for (const page of enabledCustomPages) {
            const tabId = `custom_${page.id}`;
            if (activeTabs.includes(tabId)) {
                const btn = document.createElement('button');
                btn.className = 'tab-btn custom-tab';
                btn.textContent = page.name;
                btn.dataset.tab = tabId;
                btn.dataset.custom = 'true';
                btn.dataset.pageId = page.id;
                tabBar.appendChild(btn);
            }
        }
        
        // 添加“更多”下拉菜单
        const moreBtnContainer = document.createElement('div');
        moreBtnContainer.className = 'tab-dropdown';
        moreBtnContainer.style.position = 'relative';
        moreBtnContainer.style.display = 'inline-block';
        
        const moreBtn = document.createElement('button');
        moreBtn.className = 'tab-btn';
        moreBtn.textContent = '▼ 更多';
        moreBtnContainer.appendChild(moreBtn);
        
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-content';
        dropdown.style.position = 'absolute';
        dropdown.style.backgroundColor = '#fff';
        dropdown.style.minWidth = '120px';
        dropdown.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
        dropdown.style.zIndex = '1';
        dropdown.style.display = 'none';
        dropdown.style.borderRadius = '4px';
        dropdown.style.overflow = 'hidden';
        
        // 添加隐藏的内置选项卡
        for (const tabId of hiddenTabs) {
            if (builtInTabs[tabId]) {
                const item = document.createElement('a');
                item.href = '#';
                item.textContent = builtInTabs[tabId];
                item.style.display = 'block';
                item.style.padding = '8px 12px';
                item.style.textDecoration = 'none';
                item.style.color = '#333';
                item.onclick = (e) => {
                    e.preventDefault();
                    const newActive = [...getActiveTabs(), tabId];
                    saveActiveTabs(newActive);
                    rebuildTabsAndContents();
                };
                dropdown.appendChild(item);
            }
        }
        
        // 添加隐藏的自定义页面
        for (const page of enabledCustomPages) {
            const tabId = `custom_${page.id}`;
            if (!activeTabs.includes(tabId)) {
                const item = document.createElement('a');
                item.href = '#';
                item.textContent = page.name;
                item.style.display = 'block';
                item.style.padding = '8px 12px';
                item.style.textDecoration = 'none';
                item.style.color = '#333';
                item.onclick = (e) => {
                    e.preventDefault();
                    const newActive = [...getActiveTabs(), tabId];
                    saveActiveTabs(newActive);
                    rebuildTabsAndContents();
                };
                dropdown.appendChild(item);
            }
        }
        
        // 添加分隔线和恢复默认按钮
        const divider = document.createElement('hr');
        divider.style.margin = '4px 0';
        dropdown.appendChild(divider);
        
        const restoreItem = document.createElement('a');
        restoreItem.href = '#';
        restoreItem.textContent = '恢复默认选项卡';
        restoreItem.style.display = 'block';
        restoreItem.style.padding = '8px 12px';
        restoreItem.style.textDecoration = 'none';
        restoreItem.style.color = '#d32f2f';
        restoreItem.onclick = (e) => {
            e.preventDefault();
            restoreAllTabs();
        };
        dropdown.appendChild(restoreItem);
        
        moreBtnContainer.appendChild(dropdown);
        
        moreBtn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        };
        
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
        
        tabBar.appendChild(moreBtnContainer);
    }
    
    // 重新渲染所有tab-content
    const panel = document.querySelector('.ai-panel');
    const existingContents = panel.querySelectorAll('.tab-content');
    existingContents.forEach(c => c.remove());
    
    // 重新创建所有需要的content
    for (const tabId of activeTabs) {
        if (builtInTabs[tabId]) {
            const contentDiv = document.createElement('div');
            contentDiv.id = `tab-${tabId}`;
            contentDiv.className = 'tab-content';
            if (tabId === 'api') contentDiv.innerHTML = renderApiConfigPanel();
            else if (tabId === 'char') contentDiv.innerHTML = getCharTabContent();
            else if (tabId === 'batch') contentDiv.innerHTML = getBatchTabContent();
            else if (tabId === 'user') contentDiv.innerHTML = getUserTabContent();
            else if (tabId === 'world') contentDiv.innerHTML = getWorldTabContent();
            else if (tabId === 'world-extend') contentDiv.innerHTML = getWorldExtendTabContent();
            else if (tabId === 'relation') contentDiv.innerHTML = getRelationTabContent();
            else if (tabId === 'wardrobe') contentDiv.innerHTML = getWardrobeTabContent();
            else if (tabId === 'story') contentDiv.innerHTML = getStoryTabContent();
            else if (tabId === 'playmix') contentDiv.innerHTML = getPlaymixTabContent();
            else if (tabId === 'novel') contentDiv.innerHTML = getNovelTabContent();
            else if (tabId === 'theater') contentDiv.innerHTML = getTheaterTabContent();
            else if (tabId === 'psychology') contentDiv.innerHTML = getPsychologyTabContent();
            else if (tabId === 'stylegen') contentDiv.innerHTML = getStylegenTabContent();
            else if (tabId === 'presetgen') contentDiv.innerHTML = getPresetgenTabContent();
            else if (tabId === 'custom-mgr') contentDiv.innerHTML = renderCustomPagesManager();
            else if (tabId === 'history') contentDiv.innerHTML = '<div id="history-list" class="list-container"></div><button id="history-clear">清空历史</button>';
            else if (tabId === 'templates') contentDiv.innerHTML = '<div class="button-group"><button id="tpl-export">导出模板</button><button id="tpl-import">导入模板</button><input type="file" id="tpl-import-file" accept=".json" style="display:none"></div><div id="template-list" class="list-container"></div>';
            else if (tabId === 'template-edit') contentDiv.innerHTML = renderTemplateEditor();
            else if (tabId === 'theme') contentDiv.innerHTML = '<div class="radio-group"><label><input type="radio" name="theme-mode" value="light"> 日间模式</label><label><input type="radio" name="theme-mode" value="dark"> 夜间模式</label></div>';
            else if (tabId === 'size') contentDiv.innerHTML = '<div class="field"><label>宽度 <span id="width-val"></span> px</label><input type="range" id="width-slider" min="200" max="700" step="10"><div class="field"><label>高度 <span id="height-val"></span> px</label><input type="range" id="height-slider" min="400" max="800" step="10"></div><div class="field"><label>左边距 <span id="left-val"></span> px</label><input type="range" id="left-slider" min="0" max="500" step="10"></div><div class="field"><label>上边距 <span id="top-val"></span> px</label><input type="range" id="top-slider" min="0" max="500" step="10"></div><div class="field"><label>字体大小 <span id="font-val">13</span> px</label><input type="range" id="font-slider" min="10" max="18" step="1" value="13"></div>';
            panel.appendChild(contentDiv);
        }
    }
    
    for (const page of customPages.filter(p => p.enabled)) {
        const tabId = `custom_${page.id}`;
        if (activeTabs.includes(tabId)) {
            const contentDiv = document.createElement('div');
            contentDiv.id = `tab-${tabId}`;
            contentDiv.className = 'tab-content';
            contentDiv.innerHTML = renderCustomPageContent(page);
            panel.appendChild(contentDiv);
            bindCustomPageEvents(page.id);
        }
    }
    
    // 重新绑定选项卡点击事件
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent === '▼ 更多') return;
        btn.onclick = (e) => {
            const id = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetContent = document.getElementById(`tab-${id}`);
            if (targetContent) targetContent.classList.add('active');
            
            if (id === 'relation') refreshRelationList();
            if (id === 'world-extend') {
                const checkboxes = document.querySelectorAll('.extend-type-checkbox');
                checkboxes.forEach(cb => {
                    cb.onchange = () => updateExtendTypes();
                });
                updateExtendTypes();
            }
            if (id === 'template-edit') {
                refreshTemplateEditor();
                bindTemplateEditorEvents();
            }
            if (id === 'custom-mgr') {
                refreshCustomPagesUI();
                bindCustomPageManagerEvents();
            }
            if (id === 'history') refreshHistoryList();
            if (id === 'templates') refreshTemplateList();
            
            // 添加删除当前页面的按钮到内容区底部
            const contentArea = targetContent;
            if (contentArea && !contentArea.querySelector('.delete-tab-btn')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '删除此页面';
                deleteBtn.className = 'delete-tab-btn';
                deleteBtn.style.marginTop = '20px';
                deleteBtn.style.background = '#d32f2f';
                deleteBtn.style.color = 'white';
                deleteBtn.style.padding = '6px 12px';
                deleteBtn.style.border = 'none';
                deleteBtn.style.borderRadius = '8px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.onclick = () => {
                    if (confirm(`确定要删除“${builtInTabs[id] || id}”页面吗？可以在“更多”菜单中恢复。`)) {
                        hideTab(id);
                    }
                };
                contentArea.appendChild(deleteBtn);
            }
            
            const result = document.getElementById(`${id}-result`);
            if (result?.classList.contains('result-text')) {
                const draft = loadDraft(id);
                if (draft && !result.value) result.value = draft;
            }
        };
    });
    
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) {
        const apiTab = document.querySelector('.tab-btn[data-tab="api"]');
        if (apiTab) apiTab.click();
    }
}

// 辅助函数：获取各个选项卡的HTML内容
function getCharTabContent() {
    return `<div class="field"><label>简单设定</label><textarea id="char-input" rows="3" placeholder="例如：前锋，是所有屠孝子心里最柔软的地方"></textarea></div>
            <button id="char-gen" class="primary-btn">生成角色卡</button>
            <div class="field"><label>生成结果</label><textarea id="char-result" class="result-text" rows="10"></textarea></div>
            <div class="button-group"><button id="char-copy" class="copy-btn">复制</button><button id="char-clear">清空</button></div>
            <div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="char-template-name" placeholder="模板名称"><button id="char-save-tpl">保存</button></div></div>`;
}

function getBatchTabContent() {
    return `<div class="field"><label>批量设定（每行一个角色）</label><textarea id="batch-input" rows="5" placeholder="例如：&#10;前锋，屠孝子心中最柔软的地方&#10;医生，温柔冷静的急救专家"></textarea></div>
            <button id="batch-gen" class="primary-btn">批量生成</button>
            <div class="field"><label>生成结果</label><textarea id="batch-result" class="result-text" rows="10"></textarea></div>
            <div class="button-group"><button id="batch-copy" class="copy-btn">复制</button><button id="batch-clear">清空</button></div>`;
}

function getUserTabContent() {
    return `<div class="field"><label>简单设定</label><textarea id="user-input" rows="3" placeholder="例如：菲利普，锋儿最爱的老公"></textarea></div>
            <button id="user-gen" class="primary-btn">生成用户人设</button>
            <div class="field"><label>生成结果</label><textarea id="user-result" class="result-text" rows="10"></textarea></div>
            <div class="button-group"><button id="user-copy" class="copy-btn">复制</button><button id="user-clear">清空</button></div>
            <div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="user-template-name" placeholder="模板名称"><button id="user-save-tpl">保存</button></div></div>`;
}

function getWorldTabContent() {
    return `<div class="field"><label>设定要求</label><textarea id="world-input" rows="4" placeholder="例如：赛博朋克都市，企业控制，义体改造..."></textarea></div>
            <button id="world-gen" class="primary-btn">生成世界书</button>
            <div class="field"><label>生成结果</label><textarea id="world-result" class="result-text" rows="8"></textarea></div>
            <div class="button-group"><button id="world-copy" class="copy-btn">复制</button><button id="world-clear">清空</button></div>
            <div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="world-template-name" placeholder="模板名称"><button id="world-save-tpl">保存</button></div></div>`;
}

function getWorldExtendTabContent() {
    return `<div class="field"><label>要扩展的内容</label><textarea id="world-extend-source" rows="6" placeholder="请输入你要扩展的世界观设定或角色设定..."></textarea></div>
            <div class="field"><label>扩展类型（可多选）</label>
            <div class="extend-checkboxes">
            <label><input type="checkbox" class="extend-type-checkbox" value="location"> 地点</label>
            <label><input type="checkbox" class="extend-type-checkbox" value="faction"> 势力</label>
            <label><input type="checkbox" class="extend-type-checkbox" value="event"> 事件</label>
            <label><input type="checkbox" class="extend-type-checkbox" value="culture"> 文化</label>
            <label><input type="checkbox" class="extend-type-checkbox" value="technology"> 科技</label>
            <label><input type="checkbox" class="extend-type-checkbox" value="character"> 重要人物</label>
            </div></div>
            <button id="world-extend-generate" class="primary-btn" disabled>生成扩展</button>
            <div class="field"><label>扩展结果</label><textarea id="world-extend-result" class="result-text" rows="10"></textarea></div>
            <div class="button-group"><button id="world-extend-copy" class="copy-btn">复制</button><button id="world-extend-clear">清空</button></div>`;
}

function getRelationTabContent() {
    return `<div class="field"><label>角色列表</label><div id="relation-list" class="list-container"></div></div>
            <div class="flex-row"><input type="text" id="relation-name" placeholder="角色名称"><button id="relation-add">添加</button></div>
            <textarea id="relation-desc" rows="2" placeholder="角色描述（可选）"></textarea>
            <button id="relation-gen" class="primary-btn">生成关系描述</button>
            <div class="field"><label>关系描述</label><textarea id="relation-result" class="result-text" rows="10"></textarea></div>
            <div class="button-group"><button id="relation-copy" class="copy-btn">复制</button><button id="relation-clear">清空</button></div>
            <div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="relation-template-name" placeholder="模板名称"><button id="relation-save-tpl">保存</button></div></div>`;
}

function getWardrobeTabContent() {
    return `<div class="field"><label>模式选择</label>
            <div class="radio-group">
            <label><input type="radio" name="wardrobe-mode" value="keyword" checked> 关键词生成</label>
            <label><input type="radio" name="wardrobe-mode" value="character"> 人设推断</label>
            <label><input type="radio" name="wardrobe-mode" value="scene"> 剧情分析</label>
            <label><input type="radio" name="wardrobe-mode" value="qq"> QQ服装</label>
            </div></div>
            <div id="qq-mode-options" style="display:none;" class="field">
            <label>QQ服装子模式</label>
            <div class="radio-group">
            <label><input type="radio" name="qq-submode" value="freeform" checked> 自由描述</label>
            </div></div>
            <div class="field"><label>输入内容</label><textarea id="wardrobe-input" rows="4" placeholder="根据模式输入关键词/人设/剧情片段，QQ服装模式下可留空则AI自由发挥"></textarea></div>
            <button id="wardrobe-gen" class="primary-btn">生成衣橱</button>
            <div class="field"><label>生成结果</label><textarea id="wardrobe-result" class="result-text" rows="12"></textarea></div>
            <div class="button-group"><button id="wardrobe-copy" class="copy-btn">复制</button><button id="wardrobe-clear">清空</button></div>
            <div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="wardrobe-template-name" placeholder="模板名称"><button id="wardrobe-save-tpl">保存</button></div></div>`;
}

function getStoryTabContent() {
    return `<div class="field"><label>你想看什么？（留空则随机生成）</label>
            <textarea id="story-user-wish" rows="3" placeholder="例如：古代宫廷、师徒禁忌、追妻火葬场"></textarea></div>
            <div class="field"><label>生成数量</label><input type="number" id="story-count" min="1" max="20" value="3"></div>
            <button id="story-gen" class="primary-btn">批量生成故事</button>
            <div class="field"><label>生成结果</label><textarea id="story-result" class="result-text" rows="12"></textarea></div>
            <div class="button-group"><button id="story-copy" class="copy-btn">复制</button><button id="story-clear">清空</button></div>`;
}

function getPlaymixTabContent() {
    return `<div class="field"><label>你想看什么？（留空则随机生成）</label>
            <textarea id="playmix-user-wish" rows="3" placeholder="例如：古风、病娇、甜宠、强制爱"></textarea></div>
            <div class="field"><label>生成组数</label><input type="number" id="playmix-group-count" min="1" max="20" value="1"></div>
            <button id="playmix-gen" class="primary-btn">生成人设+玩法</button>
            <div class="field"><label>生成结果</label><textarea id="playmix-result" class="result-text" rows="16"></textarea></div>
            <div class="button-group"><button id="playmix-copy" class="copy-btn">复制</button><button id="playmix-clear">清空</button></div>`;
}

function getNovelTabContent() {
    return `<div class="field"><label>你想看什么？（留空则随机生成）</label>
            <textarea id="novel-user-input" rows="3" placeholder="例如：星际世界观，军官男主，医生女主，相爱相杀"></textarea></div>
            <div class="field"><label>风格标签（可自定义，逗号分隔）</label>
            <input type="text" id="novel-style-tags" placeholder="例如：甜宠,虐心,悬疑,轻松,热血,古风,现代,星际" value="甜宠,虐心,悬疑,轻松,热血,古风,现代"></div>
            <div class="field"><label>章节字数：<span id="word-count-val">500</span> 字</label>
            <input type="range" id="novel-word-count" min="300" max="1000" step="50" value="500"></div>
            <div class="field"><label>生成章数</label>
            <input type="number" id="novel-chapter-count" min="1" max="20" value="5"></div>
            <div class="button-group">
            <button id="novel-generate" class="primary-btn" style="flex:1;">生成新小说</button>
            <button id="novel-continue" class="primary-btn" style="flex:1; background:#6c8f5e;">续写</button>
            <button id="novel-clear" class="primary-btn" style="flex:1; background:#a55a5a;">清空</button>
            </div>
            <div class="field"><label>书名</label>
            <div id="novel-title" class="novel-title-display"></div></div>
            <div class="field"><label>文案</label>
            <textarea id="novel-blurb" class="result-text" rows="4" readonly></textarea></div>
            <div class="field"><label>章节内容</label>
            <div id="novel-chapters" class="novel-chapters"></div></div>
            <div class="button-group"><button id="novel-copy" class="copy-btn">复制全部</button></div>`;
}

function getTheaterTabContent() {
    return `<div class="field"><label>关键词（可选，留空则随机生成，多个关键词用逗号分隔）</label>
            <textarea id="theater-keywords" rows="3" placeholder="例如：穿越,失忆,替身,追妻,误会,破镜重圆"></textarea></div>
            <div class="field"><label>生成数量</label>
            <input type="number" id="theater-count" min="1" max="20" value="3"></div>
            <button id="theater-gen" class="primary-btn">生成小剧场</button>
            <div class="field"><label>生成结果</label>
            <textarea id="theater-result" class="result-text" rows="16"></textarea></div>
            <div class="button-group"><button id="theater-copy" class="copy-btn">复制</button><button id="theater-clear">清空</button></div>`;
}

function getPsychologyTabContent() {
    return `<div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0;">人格/心理分析</h4>
            <div class="field"><label>提供人设或剧情</label>
            <textarea id="psychology-input" rows="4" placeholder="例如：一个从小被父母忽视的女孩，长大后总是讨好他人，不敢拒绝..."></textarea></div>
            <button id="psychology-analyze" class="primary-btn">生成分析报告</button>
            <div class="field"><label>分析结果</label>
            <textarea id="psychology-result" class="result-text" rows="28" readonly></textarea></div>
            <div class="button-group"><button id="psychology-copy" class="copy-btn">复制</button><button id="psychology-clear">清空</button></div>
            </div>
            <hr style="margin: 20px 0;">
            <div>
            <h4 style="margin: 0 0 12px 0;">MBTI人格分析</h4>
            <div class="field"><label>提供人设</label>
            <textarea id="mbti-character-input" rows="3" placeholder="例如：一个冷面刑警，独来独往，逻辑缜密，不擅表达情感..."></textarea></div>
            <button id="mbti-test" class="primary-btn">分析MBTI</button>
            <div class="field"><label>分析结果</label>
            <textarea id="mbti-result" class="result-text" rows="16" readonly></textarea></div>
            <div class="button-group"><button id="mbti-copy" class="copy-btn">复制</button><button id="mbti-clear">清空</button></div>
            </div>`;
}

function getStylegenTabContent() {
    return `<div class="field"><label>模式选择</label>
            <div class="radio-group">
            <label><input type="radio" name="style-mode" value="analyze" checked> 从文字分析</label>
            <label><input type="radio" name="style-mode" value="keyword"> 从关键词/作家名生成</label>
            </div></div>
            <div class="field"><label>输入内容</label>
            <textarea id="style-input" rows="5" placeholder="模式A：粘贴一段文字&#10;模式B：输入关键词（如：潮湿缱绻 白水烹鲜）或作家名（如：余华 村上春树）"></textarea></div>
            <div class="field"><label>生成数量</label>
            <input type="number" id="style-count" min="1" max="20" value="1"></div>
            <button id="style-gen" class="primary-btn">生成文风</button>
            <div class="field"><label>生成结果</label>
            <textarea id="style-result" class="result-text" rows="28"></textarea></div>
            <div class="button-group"><button id="style-copy" class="copy-btn">复制</button><button id="style-clear">清空</button></div>`;
}

function getPresetgenTabContent() {
    return `<div class="field"><label>关键词</label>
            <textarea id="preset-input" rows="5" placeholder="例如：兽化加强、凝视char、多人互动"></textarea></div>
            <div class="field"><label>生成数量</label>
            <input type="number" id="preset-count" min="1" max="20" value="1"></div>
            <button id="preset-gen" class="primary-btn">生成预设</button>
            <div class="field"><label>生成结果</label>
            <textarea id="preset-result" class="result-text" rows="20"></textarea></div>
            <div class="button-group"><button id="preset-copy" class="copy-btn">复制</button><button id="preset-clear">清空</button></div>`;
}

function refreshTemplateEditor() {
    const container = document.getElementById('tab-template-edit');
    if (container) {
        container.innerHTML = renderTemplateEditor();
        bindTemplateEditorEvents();
    }
}

// ========== 模板编辑页 ==========
function renderTemplateEditor() {
    let customPagesHtml = '';
    for (const page of customPages) {
        for (const submode of (page.submodes || [])) {
            const templateKey = `custom_${page.name}_${submode.id}`;
            const templateValue = customTemplates[templateKey] || '';
            customPagesHtml += `
                <div class="template-card">
                    <h4>【自定义-${escapeHtml(page.name)}-${escapeHtml(submode.name)}】提示词</h4>
                    <textarea id="edit-custom-${page.id}-${submode.id}" rows="8" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="在这里填写提示词模板，可使用变量如 {input1} {count} {submode} 等">${escapeHtml(templateValue)}</textarea>
                    <button id="save-custom-${page.id}-${submode.id}" class="save-tpl-btn">保存提示词</button>
                </div>
            `;
        }
    }
    
    return `
        <div class="template-editor-grid">
            <div class="grid-col">
                <div class="template-card">
                    <h4>角色卡模板</h4>
                    <textarea id="edit-char-template" rows="12" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.character)}</textarea>
                    <button id="save-char-template" class="save-tpl-btn">保存角色卡模板</button>
                </div>
                
                <div class="template-card">
                    <h4>关系描述模板</h4>
                    <textarea id="edit-relation-template" rows="8" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.relationship)}</textarea>
                    <button id="save-relation-template" class="save-tpl-btn">保存关系描述模板</button>
                </div>
                
                <div class="template-card">
                    <h4>魔法衣橱模板</h4>
                    <textarea id="edit-wardrobe-template" rows="8" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.wardrobe)}</textarea>
                    <button id="save-wardrobe-template" class="save-tpl-btn">保存魔法衣橱模板</button>
                </div>
                
                <div class="template-card">
                    <h4>世界书提示词</h4>
                    <textarea id="edit-worldbook-prompt" rows="4" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.worldbook)}</textarea>
                    <button id="save-worldbook-prompt" class="save-tpl-btn">保存世界书提示词</button>
                </div>
                
                <div class="template-card">
                    <h4>身份词库</h4>
                    <textarea id="edit-identity" rows="4" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="每行一个身份"></textarea>
                    <button id="save-identity" class="save-tpl-btn">保存身份词库</button>
                </div>
                
                <div class="template-card">
                    <h4>关系词库</h4>
                    <textarea id="edit-relation" rows="4" style="width:100%; font-family
