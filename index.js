// AI Character Generator - 日夜间模式 + 智能世界书扩展版
// 包含：角色卡、用户人设、批量生成、世界书、魔法衣橱(含QQ服装)、玩法生成器、自定义页面管理器

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
    wardrobe: ''
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
    wardrobe: '魔法衣橱',
    playmix: '玩法生成器',
    'custom-mgr': '自定义页面',
    history: '历史',
    templates: '模板库',
    'template-edit': '模板编辑',
    size: '大小'
};

function getActiveTabs() {
    try {
        const saved = localStorage.getItem(`${EXTENSION_NAME}_${STORAGE_KEYS.ACTIVE_TABS}`);
        if (saved && JSON.parse(saved).length > 0) {
            return JSON.parse(saved);
        }
    } catch(e) {}
    return ['api', 'char', 'batch', 'user', 'world', 'wardrobe', 'custom-mgr'];
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
    saveActiveTabs(['api', 'char', 'batch', 'user', 'world', 'wardrobe', 'custom-mgr']);
    rebuildTabsAndContents();
}

// ============================================================================
// 默认模板
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

if (!customTemplates.character) customTemplates.character = DEFAULT_CHAR_TEMPLATE;
if (!customTemplates.user) customTemplates.user = DEFAULT_CHAR_TEMPLATE;
if (!customTemplates.wardrobe) customTemplates.wardrobe = DEFAULT_WARDROBE_TEMPLATE;
if (!customTemplates.worldbook) customTemplates.worldbook = DEFAULT_WORLDBOOK_PROMPT;

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
  }// ============================================================================
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
            if (typeof toastr !== 'undefined') toastr.success('API连接成功');
        } else {
            statusDiv.innerHTML = `<span style="color: #d32f2f;">连接失败: ${response.status}</span>`;
            if (typeof toastr !== 'undefined') toastr.error(`连接失败: ${response.status}`);
        }
    } catch (e) {
        statusDiv.innerHTML = `<span style="color: #d32f2f;">连接失败: ${e.message}</span>`;
        if (typeof toastr !== 'undefined') toastr.error(`连接失败: ${e.message}`);
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
                if (typeof toastr !== 'undefined') toastr.success(`已获取 ${models.length} 个模型`);
            } else {
                statusDiv.innerHTML = '<span style="color: #d32f2f;">未获取到模型列表</span>';
            }
        } else {
            statusDiv.innerHTML = `<span style="color: #d32f2f;">获取失败: ${response.status}</span>`;
            if (typeof toastr !== 'undefined') toastr.error(`获取失败: ${response.status}`);
        }
    } catch (e) {
        statusDiv.innerHTML = `<span style="color: #d32f2f;">获取失败: ${e.message}</span>`;
        if (typeof toastr !== 'undefined') toastr.error(`获取失败: ${e.message}`);
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
// API调用函数
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
// 主函数
// ============================================================================

function initPlugin() {
const PANEL_ID = 'ai-char-generator-panel';

loadApiConfig();
loadCustomTemplates();
loadCustomPages();

let config = {
panelWidth: 420,
panelHeight: 720,
panelLeft: 20,
panelTop: 50,
savedTemplates: [],
generationHistory: [],
draftContent: {}
};

function getInitialPanelWidth() {
    const screenWidth = window.innerWidth;
    let initialWidth = config.panelWidth;
    if (initialWidth > screenWidth - 40 || initialWidth === 420) {
        initialWidth = Math.min(screenWidth - 40, 420);
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
if (typeof toastr !== 'undefined') toastr.success('已导出');
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
if (typeof toastr !== 'undefined') toastr.success(`导入 ${imported.length} 个模板`);
} else {
if (typeof toastr !== 'undefined') toastr.error('文件格式错误');
}
} catch (err) {
if (typeof toastr !== 'undefined') toastr.error('解析失败');
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
else if (h.type === '魔法衣橱') document.getElementById('wardrobe-result').value = h.output;
if (typeof toastr !== 'undefined') toastr.success(`已加载: ${h.type}`);
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
if (typeof toastr !== 'undefined') toastr.success(`已加载: ${t.name}`);
};
});
container.querySelectorAll('.delete-template').forEach(btn => {
btn.onclick = () => {
config.savedTemplates.splice(parseInt(btn.dataset.index), 1);
saveConfig();
refreshTemplateList();
if (typeof toastr !== 'undefined') toastr.success('已删除');
};
});
}

// ========== 角色卡 ==========
async function generateCharacter(userInput, cardType, btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
if (typeof toastr !== 'undefined') toastr.error('请先配置 API（地址、Key、模型）');
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
if (typeof toastr !== 'undefined') toastr.success('生成成功');
return cleanedContent;
} catch (err) {
if (typeof toastr !== 'undefined') toastr.error(`失败: ${err.message}`);
return null;
} finally {
if (btn) { btn.disabled = false; btn.textContent = cardType === 'character' ? '生成角色卡' : '生成用户人设'; }
}
}

// ========== 世界书 ==========
async function generateWorldbook(userInput, btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
if (typeof toastr !== 'undefined') toastr.error('请先配置 API（地址、Key、模型）');
return null;
}
if (!userInput.trim()) { if (typeof toastr !== 'undefined') toastr.warning('请输入设定要求'); return null; }
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
if (typeof toastr !== 'undefined') toastr.success('生成成功');
return content;
} catch (err) {
if (typeof toastr !== 'undefined') toastr.error(`失败: ${err.message}`);
return null;
} finally {
if (btn) { btn.disabled = false; btn.textContent = '生成世界书'; }
}
}

// ========== 魔法衣橱 ==========
let qqClothingTemplates = { freeform: '' };

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
        if (typeof toastr !== 'undefined') toastr.error('请先配置 API');
        return null;
    }
    if (!userInput.trim() && mode !== 'qq') { 
        if (typeof toastr !== 'undefined') toastr.warning('请输入内容'); 
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
        if (typeof toastr !== 'undefined') toastr.success('生成成功');
        return content;
    } catch (err) {
        if (typeof toastr !== 'undefined') toastr.error(`失败: ${err.message}`);
        return null;
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '生成衣橱'; }
    }
}

// ========== 批量生成角色卡 ==========
async function batchGenerateCharacters(userInput, btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
if (typeof toastr !== 'undefined') toastr.error('请先配置 API（地址、Key、模型）');
return null;
}
const lines = userInput.split('\n').filter(l => l.trim());
if (lines.length === 0) { if (typeof toastr !== 'undefined') toastr.warning('请输入角色设定，每行一个'); return null; }

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
if (typeof toastr !== 'undefined') toastr.success(`生成完成，共 ${lines.length} 个角色`);
if (btn) { btn.disabled = false; btn.textContent = '批量生成'; }
}

// ========== 复制功能 ==========
function copyToClipboard(text) {
if (!text || !text.trim()) {
if (typeof toastr !== 'undefined') toastr.warning('没有内容可复制');
return;
}
navigator.clipboard.writeText(text).then(() => {
if (typeof toastr !== 'undefined') toastr.success('已复制');
}).catch(() => {
if (typeof toastr !== 'undefined') toastr.error('复制失败');
});
      }// ========== 自定义页面管理器 ==========
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
                    <div class="flex-row" style="margin-top: 8px;">
                        <button id="add-submode-row" type="button" class="menu_button" style="flex:1;">+ 添加子模式</button>
                    </div>
                </div>
                <div class="field">
                    <label>公共输入框配置（可选，所有子模式共用）</label>
                    <div id="custom-inputs-container"></div>
                    <div class="flex-row" style="margin-top: 8px;">
                        <button id="add-input-row" type="button" class="menu_button" style="flex:1;">+ 添加输入框</button>
                    </div>
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
            <input type="text" class="submode-id" placeholder="子模式标识" value="${escapeHtml(id || 'submode'+(idx+1))}" style="width: 120px;">
            <input type="text" class="submode-name" placeholder="显示名称" value="${escapeHtml(name || '子模式'+(idx+1))}" style="width: 120px;">
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
            <input type="text" class="input-id" placeholder="变量名" value="${escapeHtml(id || 'input'+(idx+1))}" style="width: 100px;">
            <input type="text" class="input-label" placeholder="显示标签" value="${escapeHtml(label || '输入框'+(idx+1))}" style="width: 100px;">
            <select class="input-type">
                <option value="textarea" ${type === 'textarea' ? 'selected' : ''}>多行文本</option>
                <option value="text" ${type === 'text' ? 'selected' : ''}>单行文本</option>
                <option value="number" ${type === 'number' ? 'selected' : ''}>数字</option>
                <option value="range" ${type === 'range' ? 'selected' : ''}>滑块</option>
            </select>
            <input type="text" class="input-placeholder" placeholder="占位提示" value="${escapeHtml(placeholder || '')}" style="width: 120px;">
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
                if (typeof toastr !== 'undefined') toastr.success(`${page.name} ${page.enabled ? '已启用' : '已禁用'}`);
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
                    if (typeof toastr !== 'undefined') toastr.success('已删除');
                    if (editingPageId === btn.dataset.id) clearForm();
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
    if (addSubmodeBtn) addSubmodeBtn.onclick = () => addSubmodeRowToForm();
    
    const addInputBtn = document.getElementById('add-input-row');
    if (addInputBtn) addInputBtn.onclick = () => addInputRowToForm();
    
    const saveBtn = document.getElementById('save-custom-page');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const name = document.getElementById('custom-page-name').value.trim();
            if (!name) {
                if (typeof toastr !== 'undefined') toastr.warning('请输入页面名称');
                return;
            }
            
            const submodeRows = document.querySelectorAll('#custom-submodes-container .custom-submode-row');
            const submodes = [];
            submodeRows.forEach((row) => {
                const id = row.querySelector('.submode-id').value.trim();
                const displayName = row.querySelector('.submode-name').value.trim();
                if (id && displayName) submodes.push({ id: id, name: displayName });
            });
            
            if (submodes.length === 0) {
                if (typeof toastr !== 'undefined') toastr.warning('请至少添加一个子模式');
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
                    if (typeof toastr !== 'undefined') toastr.success('页面已更新');
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
                if (typeof toastr !== 'undefined') toastr.success('页面已创建');
                clearForm();
            }
            
            refreshCustomPagesUI();
            rebuildTabsAndContents();
            refreshTemplateEditor();
        };
    }
}

function getCustomPageTemplate(pageName, submodeId) {
    return customTemplates[`custom_${pageName}_${submodeId}`] || '';
}

function saveCustomPageTemplate(pageName, submodeId, content) {
    customTemplates[`custom_${pageName}_${submodeId}`] = content;
    saveCustomTemplates();
}

function getDeletePageButtonHtml(pageId, pageName) {
    return `<div class="delete-page-container" style="margin-top: 16px; padding: 12px; border-top: 1px solid var(--SmartThemeBorderColor); text-align: center;">
        <button id="delete_page_${pageId}" class="delete-page-btn" style="background: #d32f2f; color: white; padding: 6px 16px;">删除此页面</button>
    </div>`;
}

function renderCustomPageContent(page) {
    if (!page.enabled) return '';
    
    let submodeHtml = '';
    if (page.submodes && page.submodes.length > 0) {
        submodeHtml = `<div class="field"><label>子模式</label><div class="extend-checkboxes" id="custom_submode_group_${page.id}">`;
        page.submodes.forEach((submode, idx) => {
            submodeHtml += `<label><input type="radio" name="custom_submode_${page.id}" value="${escapeHtml(submode.id)}" ${idx === 0 ? 'checked' : ''}> ${escapeHtml(submode.name)}</label>`;
        });
        submodeHtml += `</div></div>`;
    }
    
    let inputsHtml = '';
    for (const input of page.inputs) {
        if (input.type === 'textarea') {
            inputsHtml += `<div class="field"><label>${escapeHtml(input.label)}</label><textarea id="custom_input_${page.id}_${input.id}" rows="3" placeholder="${escapeHtml(input.placeholder || '')}"></textarea></div>`;
        } else if (input.type === 'number') {
            inputsHtml += `<div class="field"><label>${escapeHtml(input.label)}</label><input type="number" id="custom_input_${page.id}_${input.id}" placeholder="${escapeHtml(input.placeholder || '')}"></div>`;
        } else if (input.type === 'range') {
            inputsHtml += `<div class="field"><label>${escapeHtml(input.label)}</label><input type="range" id="custom_input_${page.id}_${input.id}" min="1" max="20" value="1"><span id="custom_input_${page.id}_${input.id}_val">1</span></div>`;
        } else {
            inputsHtml += `<div class="field"><label>${escapeHtml(input.label)}</label><input type="text" id="custom_input_${page.id}_${input.id}" placeholder="${escapeHtml(input.placeholder || '')}"></div>`;
        }
    }
    
    let countHtml = '';
    if (page.showCount !== false) {
        countHtml = `<div class="field"><label>生成数量</label><input type="number" id="custom_count_${page.id}" min="1" max="20" value="1"></div>`;
    }
    
    return `
        <div class="custom-page-content" data-page-id="${page.id}">
            ${submodeHtml}
            ${inputsHtml}
            ${countHtml}
            <button id="custom_page_gen_${page.id}" class="primary-btn">生成</button>
            <div class="field"><label>生成结果</label><textarea id="custom_page_result_${page.id}" class="result-text" rows="12"></textarea></div>
            <div class="button-group"><button id="custom_page_copy_${page.id}" class="copy-btn">复制</button><button id="custom_page_clear_${page.id}">清空</button></div>
            ${getDeletePageButtonHtml(page.id, page.name)}
        </div>
    `;
}

function bindCustomPageEvents(pageId) {
    const genBtn = document.getElementById(`custom_page_gen_${pageId}`);
    const resultArea = document.getElementById(`custom_page_result_${pageId}`);
    const copyBtn = document.getElementById(`custom_page_copy_${pageId}`);
    const clearBtn = document.getElementById(`custom_page_clear_${pageId}`);
    const deleteBtn = document.getElementById(`delete_page_${pageId}`);
    
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm('确定要删除此页面吗？删除后可在"自定义页面"管理中重新启用。')) {
                hideTab(`custom_${pageId}`);
                if (typeof toastr !== 'undefined') toastr.success('页面已从选项卡中移除');
            }
        };
    }
    
    if (!genBtn) return;
    
    const page = customPages.find(p => p.id === pageId);
    if (page) {
        for (const input of page.inputs) {
            if (input.type === 'range') {
                const slider = document.getElementById(`custom_input_${pageId}_${input.id}`);
                const valSpan = document.getElementById(`custom_input_${pageId}_${input.id}_val`);
                if (slider && valSpan) slider.oninput = () => { valSpan.textContent = slider.value; };
            }
        }
    }
    
    genBtn.onclick = async () => {
        if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
            if (typeof toastr !== 'undefined') toastr.error('请先配置 API');
            return;
        }
        
        const page = customPages.find(p => p.id === pageId);
        if (!page) return;
        
        const selectedSubmode = document.querySelector(`input[name="custom_submode_${pageId}"]:checked`)?.value;
        if (!selectedSubmode) {
            if (typeof toastr !== 'undefined') toastr.warning('请选择一个子模式');
            return;
        }
        
        const template = getCustomPageTemplate(page.name, selectedSubmode);
        if (!template || !template.trim()) {
            if (typeof toastr !== 'undefined') toastr.warning(`请先在模板编辑页填写提示词`);
            return;
        }
        
        let systemPrompt = template;
        const variables = {};
        for (const input of page.inputs) {
            const el = document.getElementById(`custom_input_${pageId}_${input.id}`);
            if (el) variables[input.id] = el.value || '';
        }
        const countEl = document.getElementById(`custom_count_${pageId}`);
        variables['count'] = countEl ? countEl.value : '1';
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
            if (typeof toastr !== 'undefined') toastr.success('生成成功');
        } catch(err) {
            if (typeof toastr !== 'undefined') toastr.error(`失败: ${err.message}`);
        } finally {
            if (genBtn) { genBtn.disabled = false; genBtn.textContent = '生成'; }
        }
    };
    
    if (copyBtn) copyBtn.onclick = () => copyToClipboard(resultArea?.value || '');
    if (clearBtn) clearBtn.onclick = () => { if(resultArea) resultArea.value = ''; if(copyBtn) copyBtn.disabled = true; };
    if(resultArea) resultArea.addEventListener('input', () => { if(copyBtn) copyBtn.disabled = !resultArea.value; saveDraft(`custom_${pageId}`, resultArea.value); });
    if(resultArea) resultArea.value = loadDraft(`custom_${pageId}`);
}

// ========== 内置页面删除按钮 ==========
function addBuiltinPageDeleteButton(tabId, pageName) {
    const container = document.getElementById(`tab-${tabId}`);
    if (!container || container.querySelector('.builtin-delete-container')) return;
    
    const deleteHtml = `<div class="builtin-delete-container" style="margin-top: 16px; padding: 12px; border-top: 1px solid var(--SmartThemeBorderColor); text-align: center;">
        <button id="delete_builtin_${tabId}" class="delete-page-btn" style="background: #d32f2f; color: white; padding: 6px 16px;">删除此页面</button>
    </div>`;
    container.insertAdjacentHTML('beforeend', deleteHtml);
    
    const deleteBtn = document.getElementById(`delete_builtin_${tabId}`);
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm(`确定要从选项卡中删除"${pageName}"吗？\n\n可以在"更多"菜单中重新添加。`)) {
                hideTab(tabId);
                if (typeof toastr !== 'undefined') toastr.success(`已删除"${pageName}"选项卡`);
            }
        };
    }
}

// ========== 选项卡管理器 ==========
function rebuildTabsAndContents() {
    const activeTabs = getActiveTabs();
    const hiddenTabs = Object.keys(builtInTabs).filter(id => !activeTabs.includes(id));
    
    const tabBar = document.querySelector('.tab-bar');
    if (tabBar) {
        tabBar.innerHTML = '';
        
        for (const tabId of activeTabs) {
            if (builtInTabs[tabId]) {
                const btn = document.createElement('button');
                btn.className = 'tab-btn';
                btn.textContent = builtInTabs[tabId];
                btn.dataset.tab = tabId;
                tabBar.appendChild(btn);
            }
        }
        
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
        dropdown.style.backgroundColor = 'var(--SmartThemeBlurTintColor)';
        dropdown.style.backdropFilter = 'blur(10px)';
        dropdown.style.minWidth = '120px';
        dropdown.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
        dropdown.style.zIndex = '1';
        dropdown.style.display = 'none';
        dropdown.style.borderRadius = '4px';
        dropdown.style.overflow = 'hidden';
        
        for (const tabId of hiddenTabs) {
            if (builtInTabs[tabId]) {
                const item = document.createElement('a');
                item.href = '#';
                item.textContent = builtInTabs[tabId];
                item.style.display = 'block';
                item.style.padding = '8px 12px';
                item.style.textDecoration = 'none';
                item.style.color = 'var(--SmartThemeBodyColor)';
                item.onclick = (e) => {
                    e.preventDefault();
                    saveActiveTabs([...getActiveTabs(), tabId]);
                    rebuildTabsAndContents();
                };
                dropdown.appendChild(item);
            }
        }
        
        for (const page of enabledCustomPages) {
            const tabId = `custom_${page.id}`;
            if (!activeTabs.includes(tabId)) {
                const item = document.createElement('a');
                item.href = '#';
                item.textContent = page.name;
                item.style.display = 'block';
                item.style.padding = '8px 12px';
                item.style.textDecoration = 'none';
                item.style.color = 'var(--SmartThemeBodyColor)';
                item.onclick = (e) => {
                    e.preventDefault();
                    saveActiveTabs([...getActiveTabs(), tabId]);
                    rebuildTabsAndContents();
                };
                dropdown.appendChild(item);
            }
        }
        
        const divider = document.createElement('hr');
        divider.style.margin = '4px 0';
        divider.style.borderColor = 'var(--SmartThemeBorderColor)';
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
        moreBtn.onclick = (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; };
        document.addEventListener('click', () => { dropdown.style.display = 'none'; });
        tabBar.appendChild(moreBtnContainer);
    }
    
    const panel = document.querySelector('.ai-panel');
    if (!panel) return;
    const existingContents = panel.querySelectorAll('.tab-content');
    existingContents.forEach(c => c.remove());
    
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
            else if (tabId === 'wardrobe') contentDiv.innerHTML = getWardrobeTabContent();
            else if (tabId === 'custom-mgr') contentDiv.innerHTML = renderCustomPagesManager();
            else if (tabId === 'history') contentDiv.innerHTML = '<div id="history-list" class="list-container"></div><button id="history-clear">清空历史</button>';
            else if (tabId === 'templates') contentDiv.innerHTML = '<div class="button-group"><button id="tpl-export">导出模板</button><button id="tpl-import">导入模板</button><input type="file" id="tpl-import-file" accept=".json" style="display:none"></div><div id="template-list" class="list-container"></div>';
            else if (tabId === 'template-edit') contentDiv.innerHTML = renderTemplateEditor();
            else if (tabId === 'size') contentDiv.innerHTML = '<div class="field"><label>宽度 <span id="width-val"></span> px</label><input type="range" id="width-slider" min="200" max="700" step="10"><div class="field"><label>高度 <span id="height-val"></span> px</label><input type="range" id="height-slider" min="400" max="800" step="10"></div><div class="field"><label>左边距 <span id="left-val"></span> px</label><input type="range" id="left-slider" min="0" max="500" step="10"></div><div class="field"><label>上边距 <span id="top-val"></span> px</label><input type="range" id="top-slider" min="0" max="500" step="10"></div><div class="field"><label>字体大小 <span id="font-val">13</span> px</label><input type="range" id="font-slider" min="10" max="18" step="1" value="13"></div>';
            panel.appendChild(contentDiv);
            
            if (tabId !== 'api' && tabId !== 'custom-mgr') {
                setTimeout(() => addBuiltinPageDeleteButton(tabId, builtInTabs[tabId]), 50);
            }
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
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent === '▼ 更多') return;
        btn.onclick = (e) => {
            const id = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetContent = document.getElementById(`tab-${id}`);
            if (targetContent) targetContent.classList.add('active');
            
            if (id === 'template-edit') { refreshTemplateEditor(); bindTemplateEditorEvents(); }
            if (id === 'custom-mgr') { refreshCustomPagesUI(); bindCustomPageManagerEvents(); }
            if (id === 'history') refreshHistoryList();
            if (id === 'templates') refreshTemplateList();
            if (id === 'size') bindSizeEvents();
            
            if (id !== 'api' && id !== 'custom-mgr' && builtInTabs[id]) {
                addBuiltinPageDeleteButton(id, builtInTabs[id]);
            }
            
            const result = document.getElementById(`${id}-result`);
            if (result?.classList.contains('result-text')) {
                const draft = loadDraft(id);
                if (draft && !result.value) result.value = draft;
            }
        };
    });
    
    bindApiConfigEvents();
    bindAllGenerationEvents();
    bindSizeEvents();
    applyTheme();
    
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) document.querySelector('.tab-btn[data-tab="api"]')?.click();
}

// ========== 绑定所有生成按钮事件 ==========
function bindAllGenerationEvents() {
    const charGen = document.getElementById('char-gen');
    const charInput = document.getElementById('char-input');
    const charResult = document.getElementById('char-result');
    const charCopy = document.getElementById('char-copy');
    const charClear = document.getElementById('char-clear');
    const charSaveTpl = document.getElementById('char-save-tpl');
    const charTemplateName = document.getElementById('char-template-name');
    
    if (charGen && charInput && charResult) charGen.onclick = () => generateCharacter(charInput.value, 'character', charGen, charResult);
    if (charCopy && charResult) charCopy.onclick = () => copyToClipboard(charResult.value);
    if (charClear && charResult) charClear.onclick = () => { charResult.value = ''; };
    if (charSaveTpl && charTemplateName && charResult) {
        charSaveTpl.onclick = () => {
            const name = charTemplateName.value.trim();
            if (name && charResult.value) {
                config.savedTemplates.push({ name, content: charResult.value });
                saveConfig();
                refreshTemplateList();
                if (typeof toastr !== 'undefined') toastr.success('模板已保存');
            } else if (typeof toastr !== 'undefined') toastr.warning('请输入模板名称且结果不为空');
        };
    }
    
    const userGen = document.getElementById('user-gen');
    const userInput = document.getElementById('user-input');
    const userResult = document.getElementById('user-result');
    const userCopy = document.getElementById('user-copy');
    const userClear = document.getElementById('user-clear');
    const userSaveTpl = document.getElementById('user-save-tpl');
    const userTemplateName = document.getElementById('user-template-name');
    
    if (userGen && userInput && userResult) userGen.onclick = () => generateCharacter(userInput.value, 'user', userGen, userResult);
    if (userCopy && userResult) userCopy.onclick = () => copyToClipboard(userResult.value);
    if (userClear && userResult) userClear.onclick = () => { userResult.value = ''; };
    if (userSaveTpl && userTemplateName && userResult) {
        userSaveTpl.onclick = () => {
            const name = userTemplateName.value.trim();
            if (name && userResult.value) {
                config.savedTemplates.push({ name, content: userResult.value });
                saveConfig();
                refreshTemplateList();
                if (typeof toastr !== 'undefined') toastr.success('模板已保存');
            } else if (typeof toastr !== 'undefined') toastr.warning('请输入模板名称且结果不为空');
        };
    }
    
    const batchGen = document.getElementById('batch-gen');
    const batchInput = document.getElementById('batch-input');
    const batchResult = document.getElementById('batch-result');
    const batchCopy = document.getElementById('batch-copy');
    const batchClear = document.getElementById('batch-clear');
    
    if (batchGen && batchInput && batchResult) batchGen.onclick = () => batchGenerateCharacters(batchInput.value, batchGen, batchResult);
    if (batchCopy && batchResult) batchCopy.onclick = () => copyToClipboard(batchResult.value);
    if (batchClear && batchResult) batchClear.onclick = () => { batchResult.value = ''; };
    
    const worldGen = document.getElementById('world-gen');
    const worldInput = document.getElementById('world-input');
    const worldResult = document.getElementById('world-result');
    const worldCopy = document.getElementById('world-copy');
    const worldClear = document.getElementById('world-clear');
    const worldSaveTpl = document.getElementById('world-save-tpl');
    const worldTemplateName = document.getElementById('world-template-name');
    
    if (worldGen && worldInput && worldResult) worldGen.onclick = () => generateWorldbook(worldInput.value, worldGen, worldResult);
    if (worldCopy && worldResult) worldCopy.onclick = () => copyToClipboard(worldResult.value);
    if (worldClear && worldResult) worldClear.onclick = () => { worldResult.value = ''; };
    if (worldSaveTpl && worldTemplateName && worldResult) {
        worldSaveTpl.onclick = () => {
            const name = worldTemplateName.value.trim();
            if (name && worldResult.value) {
                config.savedTemplates.push({ name, content: worldResult.value });
                saveConfig();
                refreshTemplateList();
                if (typeof toastr !== 'undefined') toastr.success('模板已保存');
            } else if (typeof toastr !== 'undefined') toastr.warning('请输入模板名称且结果不为空');
        };
    }
    
    // 魔法衣橱模式选择
    const wardrobeModeRadios = document.querySelectorAll('input[name="wardrobe-mode"]');
    let wardrobeMode = 'keyword';
    if (wardrobeModeRadios.length) {
        wardrobeModeRadios.forEach(r => {
            r.onchange = () => { if (r.checked) wardrobeMode = r.value; };
        });
    }
    const qqSubmodeRadios = document.querySelectorAll('input[name="qq-submode"]');
    let qqSubmode = 'freeform';
    if (qqSubmodeRadios.length) {
        qqSubmodeRadios.forEach(r => {
            r.onchange = () => { if (r.checked) qqSubmode = r.value; };
        });
    }
    const wardrobeGen = document.getElementById('wardrobe-gen');
    const wardrobeInput = document.getElementById('wardrobe-input');
    const wardrobeResult = document.getElementById('wardrobe-result');
    if (wardrobeGen && wardrobeInput && wardrobeResult) {
        wardrobeGen.onclick = () => {
            generateWardrobe(wardrobeInput.value, wardrobeMode, qqSubmode, wardrobeGen, wardrobeResult);
        };
    }
    const wardrobeCopy = document.getElementById('wardrobe-copy');
    const wardrobeClear = document.getElementById('wardrobe-clear');
    if (wardrobeCopy && wardrobeResult) wardrobeCopy.onclick = () => copyToClipboard(wardrobeResult.value);
    if (wardrobeClear && wardrobeResult) wardrobeClear.onclick = () => { wardrobeResult.value = ''; };
    const wardrobeSaveTpl = document.getElementById('wardrobe-save-tpl');
    const wardrobeTemplateName = document.getElementById('wardrobe-template-name');
    if (wardrobeSaveTpl && wardrobeTemplateName && wardrobeResult) {
        wardrobeSaveTpl.onclick = () => {
            const name = wardrobeTemplateName.value.trim();
            if (name && wardrobeResult.value) {
                config.savedTemplates.push({ name, content: wardrobeResult.value });
                saveConfig();
                refreshTemplateList();
                if (typeof toastr !== 'undefined') toastr.success('模板已保存');
            } else if (typeof toastr !== 'undefined') toastr.warning('请输入模板名称且结果不为空');
        };
    }
    
    const historyClear = document.getElementById('history-clear');
    if (historyClear) {
        historyClear.onclick = () => {
            config.generationHistory = [];
            saveConfig();
            refreshHistoryList();
            if (typeof toastr !== 'undefined') toastr.success('已清空历史');
        };
    }
    
    const tplExport = document.getElementById('tpl-export');
    if (tplExport) tplExport.onclick = () => exportTemplates();
    const tplImport = document.getElementById('tpl-import');
    const tplImportFile = document.getElementById('tpl-import-file');
    if (tplImport && tplImportFile) {
        tplImport.onclick = () => tplImportFile.click();
        tplImportFile.onchange = (e) => { if (e.target.files.length) importTemplates(e.target.files[0]); tplImportFile.value = ''; };
    }
        }function applyTheme() {
    const panel = document.getElementById('ai-char-generator-panel');
    if (!panel) return;
    
    const isDarkTheme = document.body.classList.contains('dark') || 
        getComputedStyle(document.body).getPropertyValue('--SmartThemeBodyColor').includes('255,255,255') ||
        document.body.style.backgroundColor?.includes('#1e');
    
    if (isDarkTheme) {
        panel.classList.add('dark-mode');
        panel.classList.remove('light-mode');
    } else {
        panel.classList.add('light-mode');
        panel.classList.remove('dark-mode');
    }
    
    const styleEl = document.getElementById('apg-theme-style');
    if (styleEl) styleEl.remove();
    
    const themeStyle = document.createElement('style');
    themeStyle.id = 'apg-theme-style';
    themeStyle.textContent = `
        .ai-panel {
            background: var(--SmartThemeBlurTintColor, #1e1e1e);
            color: var(--SmartThemeBodyColor, #e0e0e0);
            border: 1px solid var(--SmartThemeBorderColor, #333);
            backdrop-filter: blur(10px);
        }
        .ai-panel .panel-header {
            background: var(--SmartThemeBlurTintColor, #2d2d2d);
            border-bottom-color: var(--SmartThemeBorderColor, #333);
        }
        .ai-panel .tab-bar {
            background: var(--SmartThemeBlurTintColor, #252525);
            border-bottom-color: var(--SmartThemeBorderColor, #333);
        }
        .ai-panel .tab-btn {
            color: var(--SmartThemeBodyColor, #aaa);
        }
        .ai-panel .tab-btn.active {
            background: var(--SmartThemeBlurTintColor, #1e1e1e);
            border-color: var(--SmartThemeBorderColor, #444);
            color: var(--SmartThemeBodyColor, #e0e0e0);
        }
        .ai-panel .field input, .ai-panel .field textarea, .ai-panel .field select {
            background: var(--SmartThemeInputBackground, #2d2d2d);
            border-color: var(--SmartThemeBorderColor, #444);
            color: var(--SmartThemeBodyColor, #e0e0e0);
        }
        .ai-panel .result-text {
            background: var(--SmartThemeInputBackground, #252525);
            color: var(--SmartThemeBodyColor, #e0e0e0);
        }
        .ai-panel .primary-btn {
            background: var(--SmartThemeQuoteColor, #4A6FA5);
            color: white;
        }
        .ai-panel .copy-btn, .ai-panel .save-tpl-btn {
            background: var(--SmartThemeQuoteColor, #4A6FA5);
            color: white;
        }
        .ai-panel .template-card, .ai-panel .custom-page-form, .ai-panel .custom-page-list {
            background: var(--SmartThemeBlurTintColor, #2a2a2a);
            border-color: var(--SmartThemeBorderColor, #444);
        }
        .ai-panel .char-item, .ai-panel .history-item, .ai-panel .template-item {
            border-bottom-color: var(--SmartThemeBorderColor, #333);
        }
        .ai-panel .char-item:hover, .ai-panel .history-item:hover {
            background: var(--SmartThemeInputBackground, #2a2a2a);
        }
        .ai-panel .extend-checkboxes label {
            background: var(--SmartThemeBlurTintColor, #2d2d2d);
            border: 1px solid var(--SmartThemeBorderColor, #444);
            border-radius: 20px;
            padding: 4px 12px;
            cursor: pointer;
        }
        .ai-panel .extend-checkboxes input[type="checkbox"],
        .ai-panel .extend-checkboxes input[type="radio"] {
            margin-right: 6px;
        }
        .ai-panel .delete-page-btn {
            background: #d32f2f;
            color: white;
        }
        .ai-panel .menu_button {
            background: var(--SmartThemeBlurTintColor, #3a3a3a);
            color: var(--SmartThemeBodyColor, #e0e0e0);
            border: 1px solid var(--SmartThemeBorderColor, #555);
        }
        .ai-panel .size-control-btn {
            background: var(--SmartThemeBlurTintColor, #3a3a3a);
            color: var(--SmartThemeBodyColor, #e0e0e0);
            border: 1px solid var(--SmartThemeBorderColor, #555);
        }
    `;
    document.head.appendChild(themeStyle);
}

function bindSizeEvents() {
    const panel = document.getElementById('ai-char-generator-panel');
    if (!panel) return;
    
    const widthSlider = document.getElementById('width-slider');
    const heightSlider = document.getElementById('height-slider');
    const leftSlider = document.getElementById('left-slider');
    const topSlider = document.getElementById('top-slider');
    const fontSlider = document.getElementById('font-slider');
    const widthVal = document.getElementById('width-val');
    const heightVal = document.getElementById('height-val');
    const leftVal = document.getElementById('left-val');
    const topVal = document.getElementById('top-val');
    const fontVal = document.getElementById('font-val');
    
    if (widthSlider) {
        widthSlider.value = config.panelWidth;
        if (widthVal) widthVal.textContent = config.panelWidth;
        widthSlider.oninput = () => {
            const v = parseInt(widthSlider.value);
            if (widthVal) widthVal.textContent = v;
            config.panelWidth = v;
            saveConfig();
            panel.style.width = v + 'px';
        };
    }
    
    if (heightSlider) {
        heightSlider.value = config.panelHeight;
        if (heightVal) heightVal.textContent = config.panelHeight;
        heightSlider.oninput = () => {
            const v = parseInt(heightSlider.value);
            if (heightVal) heightVal.textContent = v;
            config.panelHeight = v;
            saveConfig();
            panel.style.height = v + 'px';
        };
    }
    
    if (leftSlider) {
        leftSlider.value = config.panelLeft;
        leftSlider.max = window.innerWidth - 100;
        if (leftVal) leftVal.textContent = config.panelLeft;
        leftSlider.oninput = () => {
            const v = parseInt(leftSlider.value);
            if (leftVal) leftVal.textContent = v;
            config.panelLeft = v;
            saveConfig();
            panel.style.left = v + 'px';
        };
    }
    
    if (topSlider) {
        topSlider.value = config.panelTop;
        if (topVal) topVal.textContent = config.panelTop;
        topSlider.oninput = () => {
            const v = parseInt(topSlider.value);
            if (topVal) topVal.textContent = v;
            config.panelTop = v;
            saveConfig();
            panel.style.top = v + 'px';
        };
    }
    
    if (fontSlider) {
        fontSlider.value = 13;
        if (fontVal) fontVal.textContent = 13;
        fontSlider.oninput = () => {
            const v = parseInt(fontSlider.value);
            if (fontVal) fontVal.textContent = v;
            panel.style.fontSize = v + 'px';
        };
    }
}

function bindApiConfigEvents() {
    const urlInput = document.getElementById('apg-api-url');
    const keyInput = document.getElementById('apg-api-key');
    const modelSelect = document.getElementById('apg-api-model');
    
    if (urlInput) urlInput.addEventListener('change', () => { apiConfig.apiUrl = urlInput.value; saveApiConfig(); });
    if (keyInput) keyInput.addEventListener('change', () => { apiConfig.apiKey = keyInput.value; saveApiConfig(); });
    if (modelSelect) modelSelect.addEventListener('change', () => { apiConfig.apiModel = modelSelect.value; saveApiConfig(); });
    
    const testBtn = document.getElementById('apg-test-connection');
    if (testBtn) testBtn.onclick = () => testApiConnection();
    const fetchBtn = document.getElementById('apg-fetch-models');
    if (fetchBtn) fetchBtn.onclick = () => fetchModelList();
}

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

function getWardrobeTabContent() {
    return `<div class="field"><label>模式选择</label>
            <div class="extend-checkboxes">
            <label><input type="radio" name="wardrobe-mode" value="keyword" checked> 关键词生成</label>
            <label><input type="radio" name="wardrobe-mode" value="character"> 人设推断</label>
            <label><input type="radio" name="wardrobe-mode" value="scene"> 剧情分析</label>
            <label><input type="radio" name="wardrobe-mode" value="qq"> QQ服装</label>
            </div></div>
            <div id="qq-mode-options" style="display:none;" class="field">
            <label>QQ服装子模式</label>
            <div class="extend-checkboxes">
            <label><input type="radio" name="qq-submode" value="freeform" checked> 自由描述</label>
            </div></div>
            <div class="field"><label>输入内容</label><textarea id="wardrobe-input" rows="4" placeholder="根据模式输入关键词/人设/剧情片段，QQ服装模式下可留空则AI自由发挥"></textarea></div>
            <button id="wardrobe-gen" class="primary-btn">生成衣橱</button>
            <div class="field"><label>生成结果</label><textarea id="wardrobe-result" class="result-text" rows="12"></textarea></div>
            <div class="button-group"><button id="wardrobe-copy" class="copy-btn">复制</button><button id="wardrobe-clear">清空</button></div>
            <div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="wardrobe-template-name" placeholder="模板名称"><button id="wardrobe-save-tpl">保存</button></div></div>`;
}

function refreshTemplateEditor() {
    const container = document.getElementById('tab-template-edit');
    if (container) {
        container.innerHTML = renderTemplateEditor();
        bindTemplateEditorEvents();
    }
}

function renderTemplateEditor() {
    let customPagesHtml = '';
    for (const page of customPages) {
        for (const submode of (page.submodes || [])) {
            const templateValue = customTemplates[`custom_${page.name}_${submode.id}`] || '';
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
                <div class="template-card"><h4>角色卡模板</h4><textarea id="edit-char-template" rows="12" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.character)}</textarea><button id="save-char-template" class="save-tpl-btn">保存角色卡模板</button></div>
                <div class="template-card"><h4>魔法衣橱模板</h4><textarea id="edit-wardrobe-template" rows="8" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.wardrobe)}</textarea><button id="save-wardrobe-template" class="save-tpl-btn">保存魔法衣橱模板</button></div>
                <div class="template-card"><h4>世界书提示词</h4><textarea id="edit-worldbook-prompt" rows="4" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.worldbook)}</textarea><button id="save-worldbook-prompt" class="save-tpl-btn">保存世界书提示词</button></div>
                <div class="template-card"><h4>QQ服装-自由描述模板</h4><textarea id="edit-qq-freeform" rows="6" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="在这里填写自由描述模板，留空则AI自由发挥">${escapeHtml(qqClothingTemplates.freeform)}</textarea><button id="save-qq-freeform" class="save-tpl-btn">保存自由描述模板</button></div>
                ${customPagesHtml}
            </div>
        </div>
        <div class="reset-container"><button id="reset-all-templates" class="reset-btn">重置所有模板为默认</button></div>
    `;
}

function bindTemplateEditorEvents() {
    const saveChar = document.getElementById('save-char-template');
    if (saveChar) saveChar.onclick = () => { const v = document.getElementById('edit-char-template')?.value; if (v !== undefined) { customTemplates.character = v; saveCustomTemplates(); if (typeof toastr !== 'undefined') toastr.success('角色卡模板已保存'); } };
    
    const saveWardrobe = document.getElementById('save-wardrobe-template');
    if (saveWardrobe) saveWardrobe.onclick = () => { const v = document.getElementById('edit-wardrobe-template')?.value; if (v !== undefined) { customTemplates.wardrobe = v; saveCustomTemplates(); if (typeof toastr !== 'undefined') toastr.success('魔法衣橱模板已保存'); } };
    
    const saveWorldbook = document.getElementById('save-worldbook-prompt');
    if (saveWorldbook) saveWorldbook.onclick = () => { const v = document.getElementById('edit-worldbook-prompt')?.value; if (v !== undefined) { customTemplates.worldbook = v; saveCustomTemplates(); if (typeof toastr !== 'undefined') toastr.success('世界书提示词已保存'); } };
    
    const saveQQFreeform = document.getElementById('save-qq-freeform');
    if (saveQQFreeform) saveQQFreeform.onclick = () => { qqClothingTemplates.freeform = document.getElementById('edit-qq-freeform')?.value || ''; saveQQClothingTemplates(); if (typeof toastr !== 'undefined') toastr.success('QQ服装自由描述模板已保存'); };
    
    for (const page of customPages) {
        for (const submode of (page.submodes || [])) {
            const saveBtn = document.getElementById(`save-custom-${page.id}-${submode.id}`);
            if (saveBtn) saveBtn.onclick = () => { const v = document.getElementById(`edit-custom-${page.id}-${submode.id}`)?.value; if (v !== undefined) { saveCustomPageTemplate(page.name, submode.id, v); if (typeof toastr !== 'undefined') toastr.success(`已保存`); } };
        }
    }
    
    const resetBtn = document.getElementById('reset-all-templates');
    if (resetBtn) resetBtn.onclick = () => { if (confirm('重置所有模板为默认值？')) { location.reload(); } };
}

function createPanel() {
if (document.getElementById(PANEL_ID)) return;

const panel = document.createElement('div');
panel.id = PANEL_ID;
panel.className = 'ai-panel light-mode';
panel.style.position = 'fixed';
panel.style.left = `${config.panelLeft}px`;
panel.style.top = `${config.panelTop}px`;
panel.style.width = `${config.panelWidth}px`;
panel.style.height = `${config.panelHeight}px`;
panel.style.zIndex = '100000';
panel.style.display = 'flex';
panel.style.flexDirection = 'column';
panel.style.overflow = 'hidden';
panel.style.borderRadius = '12px';

panel.innerHTML = `
<div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; flex-shrink: 0;">
<span>AI 人设生成器</span>
<div class="header-actions" style="display: flex; align-items: center; gap: 8px;">
<button id="size-minus-btn" class="size-control-btn">−</button>
<button id="size-plus-btn" class="size-control-btn">+</button>
<button id="reset-position-btn" class="size-control-btn">↺</button>
<span class="panel-close" style="cursor: pointer;">✕</span>
</div>
</div>
<div class="tab-bar" style="display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 12px 0 12px; flex-shrink: 0;"></div>
<div class="tab-contents" style="flex: 1; overflow-y: auto;"></div>
`;

document.body.appendChild(panel);

const tabContentsDiv = panel.querySelector('.tab-contents');

const closeBtn = panel.querySelector('.panel-close');
if (closeBtn) closeBtn.onclick = () => { panel.style.display = 'none'; };

const sizeMinus = document.getElementById('size-minus-btn');
const sizePlus = document.getElementById('size-plus-btn');
const resetPos = document.getElementById('reset-position-btn');

if (sizeMinus) {
sizeMinus.onclick = () => {
let newWidth = config.panelWidth - 20;
if (newWidth < 200) newWidth = 200;
config.panelWidth = newWidth;
saveConfig();
panel.style.width = `${newWidth}px`;
const ws = document.getElementById('width-slider');
if (ws) ws.value = newWidth;
const widthVal = document.getElementById('width-val');
if (widthVal) widthVal.textContent = newWidth;
};
}

if (sizePlus) {
sizePlus.onclick = () => {
let newWidth = config.panelWidth + 20;
const maxWidth = window.innerWidth - 20;
if (newWidth > maxWidth) newWidth = maxWidth;
config.panelWidth = newWidth;
saveConfig();
panel.style.width = `${newWidth}px`;
const ws = document.getElementById('width-slider');
if (ws) ws.value = newWidth;
const widthVal = document.getElementById('width-val');
if (widthVal) widthVal.textContent = newWidth;
};
}

if (resetPos) {
resetPos.onclick = () => {
const newLeft = window.innerWidth - config.panelWidth - 20;
const newTop = 20;
config.panelLeft = newLeft;
config.panelTop = newTop;
saveConfig();
panel.style.left = `${newLeft}px`;
panel.style.top = `${newTop}px`;
const ls = document.getElementById('left-slider');
if (ls) { ls.value = newLeft; document.getElementById('left-val').textContent = newLeft; }
const ts = document.getElementById('top-slider');
if (ts) { ts.value = newTop; document.getElementById('top-val').textContent = newTop; }
};
}

rebuildTabsAndContents();

setTimeout(() => {
refreshHistoryList();
refreshTemplateList();
applyTheme();
refreshCustomPagesUI();
loadQQClothingTemplates();
}, 100);
}

function addMenuItem() {
const check = setInterval(() => {
const menu = document.querySelector('#options .options-content');
if (menu) {
clearInterval(check);
if (document.querySelector('.ai-menu-item')) return;
const item = document.createElement('div');
item.className = 'ai-menu-item';
item.innerHTML = 'AI人设生成器';
item.style.display = 'flex';
item.style.alignItems = 'center';
item.style.gap = '8px';
item.style.padding = '8px 12px';
item.style.cursor = 'pointer';
item.style.borderRadius = '6px';
item.onclick = () => {
const panel = document.getElementById(PANEL_ID);
if (panel) panel.style.display = 'flex';
};
menu.appendChild(item);
}
}, 500);
}

const style = document.createElement('style');
style.textContent = `
.ai-panel { position: fixed; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 100000; display: none; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tab-bar { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 12px 0 12px; border-bottom: 1px solid; flex-shrink: 0; }
.tab-btn { padding: 6px 12px; background: none; border: none; cursor: pointer; font-size: 12px; border-radius: 8px 8px 0 0; position: relative; }
.tab-btn.active { font-weight: 500; border: 1px solid; border-bottom-color: transparent; margin-bottom: -1px; }
.tab-content { padding: 16px; overflow-y: auto; display: none; height: 100%; box-sizing: border-box; }
.tab-content.active { display: block; }
.field { margin-bottom: 14px; }
.field label { display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500; }
.field input, .field textarea, .field select { width: 100%; padding: 8px 10px; border: 1px solid; border-radius: 8px; font-size: 13px; box-sizing: border-box; background: transparent; }
.field textarea { resize: vertical; font-family: monospace; }
.result-text { font-family: monospace; font-size: 12px; line-height: 1.5; padding: 10px; border-radius: 8px; border: 1px solid; }
button { padding: 6px 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
button:hover { filter: brightness(0.95); }
.primary-btn { width: 100%; margin-bottom: 14px; color: white; }
.button-group { display: flex; gap: 8px; margin: 10px 0; }
.flex-row { display: flex; gap: 8px; }
.flex-row input { flex: 1; }
.extend-checkboxes { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
.extend-checkboxes label { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px; padding: 4px 12px; border-radius: 20px; border: 1px solid; }
.list-container { max-height: 150px; overflow-y: auto; border: 1px solid; border-radius: 8px; margin-bottom: 10px; }
.char-item, .history-item, .template-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid; cursor: pointer; }
.char-item:hover, .history-item:hover { background: rgba(128,128,128,0.1); }
.history-type { font-weight: 500; font-size: 12px; }
.history-time { font-size: 10px; opacity: 0.6; }
.history-preview { font-size: 11px; opacity: 0.7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px; }
.template-actions { display: flex; gap: 8px; }
.empty-state { text-align: center; padding: 20px; opacity: 0.6; font-size: 13px; }
.template-editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-col { display: flex; flex-direction: column; gap: 16px; }
.template-card { border: 1px solid; border-radius: 8px; padding: 12px; }
.template-card h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: 600; }
.save-tpl-btn { margin-top: 8px; width: 100%; }
.reset-container { margin-top: 20px; text-align: center; }
.reset-btn { background: #d32f2f; color: white; padding: 8px 20px; }
.custom-page-editor { display: flex; flex-direction: column; gap: 20px; }
.custom-page-form { border: 1px solid; border-radius: 8px; padding: 16px; }
.custom-page-list { border: 1px solid; border-radius: 8px; padding: 16px; }
.custom-page-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid; }
.custom-page-item:hover { background: rgba(128,128,128,0.05); }
.custom-page-name { font-weight: 500; }
.custom-page-status { font-size: 11px; padding: 2px 6px; border-radius: 10px; margin-left: 8px; }
.custom-page-status.enabled { background: #4caf50; color: white; }
.custom-page-status.disabled { background: #999; color: white; }
.custom-page-actions button { margin-left: 8px; padding: 4px 8px; font-size: 12px; }
.custom-submode-row, .custom-input-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; flex-wrap: wrap; }
.custom-submode-row input, .custom-input-row input, .custom-input-row select { padding: 4px 8px; border-radius: 4px; border: 1px solid; background: transparent; }
.remove-submode-row, .remove-input-row { background: #d32f2f; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
.custom-page-content { padding: 0; }
.delete-page-container { margin-top: 16px; padding: 12px; border-top: 1px solid; text-align: center; }
.delete-page-btn { background: #d32f2f; color: white; padding: 6px 16px; border: none; border-radius: 8px; cursor: pointer; }
.builtin-delete-container { margin-top: 16px; padding: 12px; border-top: 1px solid; text-align: center; }
.theme-hr { margin: 20px 0; border-color: var(--SmartThemeBorderColor, #444); }
`;
document.head.appendChild(style);

addMenuItem();
createPanel();
}
})();
