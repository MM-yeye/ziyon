// AI Character Generator - 日夜间模式 + 智能世界书扩展版
// 使用模块化 API 配置系统

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
    CUSTOM_TEMPLATES: 'custom_templates'
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

// 检测屏幕宽度，自动适配初始宽度
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
async function generateWardrobe(userInput, btn, resultArea) {
if (!apiConfig.apiKey || !apiConfig.apiUrl || !apiConfig.apiModel) {
toastr.error('请先配置 API（地址、Key、模型）');
return null;
}
if (!userInput.trim()) { toastr.warning('请输入外貌/服装描述'); return null; }
const systemPrompt = `根据用户输入，生成外貌、体型、服饰等详细描述。严格按照以下YAML格式输出，所有字段都要填满。注意：只描述客观事实，直接说明是什么样的衣服、什么样的头发、什么样的饰品，避免使用"美丽""漂亮""耀眼""动人"等主观评价性语言。不渲染美感，仅呈现细节。

${customTemplates.wardrobe}`;
if (btn) { btn.disabled = true; btn.textContent = '生成中...'; }
try {
const content = await callApi(
[{ role: 'user', content: userInput }],
systemPrompt,
{ temperature: 0.8, max_tokens: 3000 }
);
if (resultArea) {
resultArea.value = content;
addToHistory('魔法衣橱', userInput, content);
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
    systemPrompt: '你是一个小说创意生成器。根据用户的要求生成小说设定和章节简介。\n\n书名要求：2-8个字，有吸引力，符合题材。\n文案要求：150-300字，包含人设介绍和故事开端悬念，像小说封底简介。\n章节简介要求：每章300-1000字，每章是一个完整的剧情段落，包含该章的核心冲突、转折或悬念。\n\n输出格式：\n书名：《xxx》\n文案：xxx\n\n章节列表：\n第1章：xxx\n第2章：xxx\n...\n\n注意：禁止多余形容词，只写干货。',
    continuePrompt: '你正在续写小说《{title}》。\n前面已写完第1-{doneCount}章，以下是已有章节的简介：\n{chapters}\n\n请继续生成第{start}到第{end}章的章节简介。\n保持故事连贯，人物不OOC，每章{wordCount}字左右。\n只输出新增的章节，格式：\n第X章：章节标题 - 章节内容简介\n\n不要重复已有内容，不要输出书名和文案。'
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
                    <div class="chapter-title">第${idx+1}章 ${ch.title || ''}</div>
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
    const chapterCount = parseInt(document.getElementById('novel-chapter-count')?.value || '5');
    
    if (wordCount < 300 || wordCount > 1000) {
        toastr.warning('章节字数请在300-1000之间');
        return;
    }
    if (chapterCount < 1 || chapterCount > 20) {
        toastr.warning('生成章数请在1-20之间');
        return;
    }
    
    let systemPrompt = novelTemplates.systemPrompt;
    let userMessage = '';
    
    if (isContinue) {
        if (currentNovel.chapters.length === 0) {
            toastr.warning('没有已有小说，请先生成');
            return;
        }
        const existingChapters = currentNovel.chapters.map((ch, i) => `第${i+1}章：${ch.title || '无标题'} - ${ch.content.substring(0, 100)}...`).join('\n');
        let continuePrompt = novelTemplates.continuePrompt;
        
        systemPrompt = continuePrompt
            .replace('{title}', currentNovel.title)
            .replace('{doneCount}', currentNovel.chapters.length)
            .replace('{chapters}', existingChapters)
            .replace('{start}', currentNovel.chapters.length + 1)
            .replace('{end}', currentNovel.chapters.length + chapterCount)
            .replace('{wordCount}', wordCount);
        
        userMessage = `请续写第${currentNovel.chapters.length+1}到第${currentNovel.chapters.length+chapterCount}章`;
    } else {
        let styleText = '';
        if (styleTags) {
            styleText = `风格标签：${styleTags}。请从这些标签中选择1-2个作为主要风格。`;
        }
        systemPrompt = systemPrompt + `\n\n${styleText}\n章节字数：${wordCount}字左右。`;
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
            const chaptersMatch = content.match(/章节列表[：:]\s*([\s\S]+)/);
            
            currentNovel.title = titleMatch ? titleMatch[1] : '未命名';
            currentNovel.blurb = blurbMatch ? blurbMatch[1].trim() : '';
            currentNovel.wordCount = wordCount;
            currentNovel.style = styleTags;
            
            if (chaptersMatch) {
                const chapterLines = chaptersMatch[1].split('\n');
                currentNovel.chapters = [];
                for (const line of chapterLines) {
                    const chMatch = line.match(/第(\d+)章[：:]\s*(.+)/);
                    if (chMatch) {
                        currentNovel.chapters.push({ title: '', content: chMatch[2].trim() });
                    }
                }
            }
            addToHistory('小说生成器', userInput || '随机生成', content);
        } else {
            const lines = content.split('\n');
            for (const line of lines) {
                const chMatch = line.match(/第(\d+)章[：:]\s*(.+)/);
                if (chMatch) {
                    currentNovel.chapters.push({ title: '', content: chMatch[2].trim() });
                }
            }
            addToHistory('小说生成器', `续写${chapterCount}章`, content);
        }
        
        saveCurrentNovel();
        displayNovel();
        toastr.success(isContinue ? '续写成功' : '生成成功');
        
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
    let text = `书名：《${currentNovel.title}》\n\n文案：\n${currentNovel.blurb}\n\n章节列表：\n`;
    currentNovel.chapters.forEach((ch, i) => {
        text += `\n第${i+1}章：${ch.content}\n`;
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

// ========== 玩法生成器（增加用户输入） ==========
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
    mbtiPrompt: `你是一位MBTI人格测试专家。请严格扮演以下角色，以该角色的身份和思维模式，回答70道MBTI标准测试题。

角色设定：{character}

请逐题输出，每道题格式为：Q[题号]. [题目内容]？ 答案：A/B/C/D

题目覆盖四个维度：
- 外向(E) vs 内向(I)：从社交能量获取方式
- 感觉(S) vs 直觉(N)：从信息接收和处理方式
- 思考(T) vs 情感(F)：从决策依据
- 判断(J) vs 感知(P)：从生活方式取向

70题全部答完后，请输出：
【测试结果】
各维度倾向比例
MBTI类型：XXXX
类型解析：[简要说明]`
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
    
    if (btn) { btn.disabled = true; btn.textContent = '生成测试中...'; }
    try {
        const content = await callApi(
            [{ role: 'user', content: '请开始MBTI测试，共70题，扮演该角色认真回答。' }],
            systemPrompt,
            { temperature: 0.6, max_tokens: 8000 }
        );
        if (resultArea) {
            resultArea.value = content;
            addToHistory('MBTI测试', character.substring(0, 80), content);
            const copyBtn = resultArea.parentElement?.querySelector('.copy-btn');
            if (copyBtn) copyBtn.disabled = false;
        }
        toastr.success('测试完成');
    } catch(err) {
        toastr.error(`失败: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '开始70题测试'; }
    }
}

// ========== 模板编辑页 ==========
function renderTemplateEditor() {
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
                    <textarea id="edit-relation" rows="4" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="每行一个关系"></textarea>
                    <button id="save-relation" class="save-tpl-btn">保存关系词库</button>
                </div>
                
                <div class="template-card">
                    <h4>小说生成器提示词</h4>
                    <textarea id="edit-novel-system" rows="6" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(novelTemplates.systemPrompt)}</textarea>
                    <button id="save-novel-system" class="save-tpl-btn">保存小说提示词</button>
                </div>
                
                <div class="template-card">
                    <h4>小剧场生成器提示词</h4>
                    <textarea id="edit-theater-system" rows="6" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(theaterTemplates.systemPrompt)}</textarea>
                    <button id="save-theater-system" class="save-tpl-btn">保存小剧场提示词</button>
                </div>
                
                <div class="template-card">
                    <h4>心理分析提示词</h4>
                    <textarea id="edit-psychology-analysis" rows="12" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(psychologyTemplates.analysisPrompt)}</textarea>
                    <button id="save-psychology-analysis" class="save-tpl-btn">保存心理分析提示词</button>
                </div>
            </div>
            
            <div class="grid-col">
                <div class="template-card">
                    <h4>世界书扩展模板</h4>
                    ${Object.entries(DEFAULT_WORLD_EXTEND_TEMPLATES).map(([key, template]) => `
                        <div style="margin-bottom: 12px;">
                            <label><strong>${typeNames[key] || key}</strong></label>
                            <textarea id="edit-extend-${key}" rows="4" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(customTemplates.worldExtend[key] || template)}</textarea>
                        </div>
                    `).join('')}
                    <button id="save-extend-templates" class="save-tpl-btn">保存所有扩展模板</button>
                </div>
                
                <div class="template-card">
                    <h4>场景词库</h4>
                    <textarea id="edit-scene" rows="4" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="每行一个场景"></textarea>
                    <button id="save-scene" class="save-tpl-btn">保存场景词库</button>
                </div>
                
                <div class="template-card">
                    <h4>空间环境玩法</h4>
                    <textarea id="edit-space" rows="4" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="每行一个玩法"></textarea>
                    <button id="save-space" class="save-tpl-btn">保存空间环境玩法</button>
                </div>
                
                <div class="template-card">
                    <h4>权力动态玩法</h4>
                    <textarea id="edit-power" rows="4" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="每行一个玩法"></textarea>
                    <button id="save-power" class="save-tpl-btn">保存权力动态玩法</button>
                </div>
                
                <div class="template-card">
                    <h4>心理情境玩法</h4>
                    <textarea id="edit-psychological" rows="4" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="每行一个玩法"></textarea>
                    <button id="save-psychological" class="save-tpl-btn">保存心理情境玩法</button>
                </div>
                
                <div class="template-card">
                    <h4>剧情玩法</h4>
                    <textarea id="edit-plot" rows="4" style="width:100%; font-family: monospace; font-size: 12px;" placeholder="每行一个玩法"></textarea>
                    <button id="save-plot" class="save-tpl-btn">保存剧情玩法</button>
                </div>
                
                <div class="template-card">
                    <h4>小说续写提示词</h4>
                    <textarea id="edit-novel-continue" rows="6" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(novelTemplates.continuePrompt)}</textarea>
                    <button id="save-novel-continue" class="save-tpl-btn">保存续写提示词</button>
                </div>
                
                <div class="template-card">
                    <h4>MBTI测试提示词</h4>
                    <textarea id="edit-mbti-prompt" rows="6" style="width:100%; font-family: monospace; font-size: 12px;">${escapeHtml(psychologyTemplates.mbtiPrompt)}</textarea>
                    <button id="save-mbti-prompt" class="save-tpl-btn">保存MBTI提示词</button>
                </div>
            </div>
        </div>
        <div class="reset-container">
            <button id="reset-all-templates" class="reset-btn">重置所有模板为默认</button>
        </div>
    `;
}

const typeNames = { location: '地点', faction: '势力', event: '事件', culture: '文化', technology: '科技', character: '重要人物' };

function bindTemplateEditorEvents() {
    const saveChar = document.getElementById('save-char-template');
    if (saveChar) {
        saveChar.onclick = () => {
            const val = document.getElementById('edit-char-template')?.value;
            if (val) {
                customTemplates.character = val;
                saveCustomTemplates();
                toastr.success('角色卡模板已保存');
            }
        };
    }
    
    const saveRelation = document.getElementById('save-relation-template');
    if (saveRelation) {
        saveRelation.onclick = () => {
            const val = document.getElementById('edit-relation-template')?.value;
            if (val) {
                customTemplates.relationship = val;
                saveCustomTemplates();
                toastr.success('关系描述模板已保存');
            }
        };
    }
    
    const saveWardrobe = document.getElementById('save-wardrobe-template');
    if (saveWardrobe) {
        saveWardrobe.onclick = () => {
            const val = document.getElementById('edit-wardrobe-template')?.value;
            if (val) {
                customTemplates.wardrobe = val;
                saveCustomTemplates();
                toastr.success('魔法衣橱模板已保存');
            }
        };
    }
    
    const saveWorldbook = document.getElementById('save-worldbook-prompt');
    if (saveWorldbook) {
        saveWorldbook.onclick = () => {
            const val = document.getElementById('edit-worldbook-prompt')?.value;
            if (val) {
                customTemplates.worldbook = val;
                saveCustomTemplates();
                toastr.success('世界书提示词已保存');
            }
        };
    }
    
    const saveExtend = document.getElementById('save-extend-templates');
    if (saveExtend) {
        saveExtend.onclick = () => {
            for (const key of Object.keys(DEFAULT_WORLD_EXTEND_TEMPLATES)) {
                const el = document.getElementById(`edit-extend-${key}`);
                if (el) {
                    customTemplates.worldExtend[key] = el.value;
                }
            }
            saveCustomTemplates();
            toastr.success('扩展模板已保存');
        };
    }
    
    const saveIdentity = document.getElementById('save-identity');
    if (saveIdentity) {
        saveIdentity.onclick = () => {
            extraTemplates.identity = document.getElementById('edit-identity')?.value || '';
            saveExtraTemplates();
            toastr.success('身份词库已保存');
        };
    }
    
    const saveRelationExtra = document.getElementById('save-relation');
    if (saveRelationExtra) {
        saveRelationExtra.onclick = () => {
            extraTemplates.relation = document.getElementById('edit-relation')?.value || '';
            saveExtraTemplates();
            toastr.success('关系词库已保存');
        };
    }
    
    const saveScene = document.getElementById('save-scene');
    if (saveScene) {
        saveScene.onclick = () => {
            extraTemplates.scene = document.getElementById('edit-scene')?.value || '';
            saveExtraTemplates();
            toastr.success('场景词库已保存');
        };
    }
    
    const saveSpace = document.getElementById('save-space');
    if (saveSpace) {
        saveSpace.onclick = () => {
            extraTemplates.gameplay_space = document.getElementById('edit-space')?.value || '';
            saveExtraTemplates();
            toastr.success('空间环境玩法已保存');
        };
    }
    
    const savePower = document.getElementById('save-power');
    if (savePower) {
        savePower.onclick = () => {
            extraTemplates.gameplay_power = document.getElementById('edit-power')?.value || '';
            saveExtraTemplates();
            toastr.success('权力动态玩法已保存');
        };
    }
    
    const savePsychological = document.getElementById('save-psychological');
    if (savePsychological) {
        savePsychological.onclick = () => {
            extraTemplates.gameplay_psychological = document.getElementById('edit-psychological')?.value || '';
            saveExtraTemplates();
            toastr.success('心理情境玩法已保存');
        };
    }
    
    const savePlot = document.getElementById('save-plot');
    if (savePlot) {
        savePlot.onclick = () => {
            extraTemplates.gameplay_plot = document.getElementById('edit-plot')?.value || '';
            saveExtraTemplates();
            toastr.success('剧情玩法已保存');
        };
    }
    
    const saveNovelSystem = document.getElementById('save-novel-system');
    if (saveNovelSystem) {
        saveNovelSystem.onclick = () => {
            novelTemplates.systemPrompt = document.getElementById('edit-novel-system')?.value || '';
            saveNovelTemplates();
            toastr.success('小说提示词已保存');
        };
    }
    
    const saveNovelContinue = document.getElementById('save-novel-continue');
    if (saveNovelContinue) {
        saveNovelContinue.onclick = () => {
            novelTemplates.continuePrompt = document.getElementById('edit-novel-continue')?.value || '';
            saveNovelTemplates();
            toastr.success('续写提示词已保存');
        };
    }
    
    const saveTheaterSystem = document.getElementById('save-theater-system');
    if (saveTheaterSystem) {
        saveTheaterSystem.onclick = () => {
            theaterTemplates.systemPrompt = document.getElementById('edit-theater-system')?.value || '';
            saveTheaterTemplates();
            toastr.success('小剧场提示词已保存');
        };
    }
    
    const savePsychologyAnalysis = document.getElementById('save-psychology-analysis');
    if (savePsychologyAnalysis) {
        savePsychologyAnalysis.onclick = () => {
            psychologyTemplates.analysisPrompt = document.getElementById('edit-psychology-analysis')?.value || '';
            savePsychologyTemplates();
            toastr.success('心理分析提示词已保存');
        };
    }
    
    const saveMbtiPrompt = document.getElementById('save-mbti-prompt');
    if (saveMbtiPrompt) {
        saveMbtiPrompt.onclick = () => {
            psychologyTemplates.mbtiPrompt = document.getElementById('edit-mbti-prompt')?.value || '';
            savePsychologyTemplates();
            toastr.success('MBTI提示词已保存');
        };
    }
    
    const resetBtn = document.getElementById('reset-all-templates');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('重置所有模板为默认值？这将丢失所有自定义修改！')) {
                customTemplates.character = DEFAULT_CHAR_TEMPLATE;
                customTemplates.user = DEFAULT_CHAR_TEMPLATE;
                customTemplates.relationship = DEFAULT_RELATIONSHIP_TEMPLATE;
                customTemplates.wardrobe = DEFAULT_WARDROBE_TEMPLATE;
                customTemplates.worldbook = DEFAULT_WORLDBOOK_PROMPT;
                customTemplates.worldExtend = { ...DEFAULT_WORLD_EXTEND_TEMPLATES };
                saveCustomTemplates();
                extraTemplates = {
                    identity: '',
                    relation: '',
                    scene: '',
                    gameplay_space: '',
                    gameplay_power: '',
                    gameplay_psychological: '',
                    gameplay_plot: ''
                };
                saveExtraTemplates();
                novelTemplates = {
                    systemPrompt: '你是一个小说创意生成器。根据用户的要求生成小说设定和章节简介。\n\n书名要求：2-8个字，有吸引力，符合题材。\n文案要求：150-300字，包含人设介绍和故事开端悬念，像小说封底简介。\n章节简介要求：每章300-1000字，每章是一个完整的剧情段落，包含该章的核心冲突、转折或悬念。\n\n输出格式：\n书名：《xxx》\n文案：xxx\n\n章节列表：\n第1章：xxx\n第2章：xxx\n...\n\n注意：禁止多余形容词，只写干货。',
                    continuePrompt: '你正在续写小说《{title}》。\n前面已写完第1-{doneCount}章，以下是已有章节的简介：\n{chapters}\n\n请继续生成第{start}到第{end}章的章节简介。\n保持故事连贯，人物不OOC，每章{wordCount}字左右。\n只输出新增的章节，格式：\n第X章：章节标题 - 章节内容简介\n\n不要重复已有内容，不要输出书名和文案。'
                };
                saveNovelTemplates();
                theaterTemplates = {
                    systemPrompt: '你是一个小剧场/番外剧情生成器。根据用户的关键词（或随机生成）生成小剧场设定。\n\n输出格式要求：\n每个小剧场以"现在立即停止正文输出，仅输出以下番外："开头，然后是具体的剧情设定描述，最后以"不少于3000字。"结尾。\n\n示例：\n现在立即停止正文输出，仅输出以下番外：{{user}}因为一场意外穿越到古代，成为了{{char}}的丫鬟，{{user}}以为自己隐藏得很好，却不知道{{char}}早就看穿了她的身份...不少于3000字。\n\n生成规则：\n1. 剧情要完整，包含起因、冲突、悬念\n2. 使用{{user}}和{{char}}作为角色占位符\n3. 不要多余形容词，只写核心剧情\n4. 如果用户提供了关键词，必须融入关键词\n5. 不同小剧场之间要有明显差异'
                };
                saveTheaterTemplates();
                psychologyTemplates = {
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
                    mbtiPrompt: '你是一位MBTI人格测试专家。请严格扮演以下角色，以该角色的身份和思维模式，回答70道MBTI标准测试题。\n\n角色设定：{character}\n\n请逐题输出，每道题格式为：Q[题号]. [题目内容]？ 答案：A/B/C/D\n\n题目覆盖四个维度：\n- 外向(E) vs 内向(I)：从社交能量获取方式\n- 感觉(S) vs 直觉(N)：从信息接收和处理方式\n- 思考(T) vs 情感(F)：从决策依据\n- 判断(J) vs 感知(P)：从生活方式取向\n\n70题全部答完后，请输出：\n【测试结果】\n各维度倾向比例\nMBTI类型：XXXX\n类型解析：[简要说明]'
                };
                savePsychologyTemplates();
                location.reload();
            }
        };
    }
}

// ========== 创建面板 ==========
function createPanel() {
if (document.getElementById(PANEL_ID)) return;

const panel = document.createElement('div');
panel.id = PANEL_ID;
panel.className = 'ai-panel';
panel.style.position = 'fixed';
panel.style.left = `${config.panelLeft}px`;
panel.style.top = `${config.panelTop}px`;
panel.style.width = `${config.panelWidth}px`;
panel.style.height = `${config.panelHeight}px`;

panel.innerHTML = `
<div class="panel-header">
<span>AI 人设生成器</span>
<div class="header-actions">
<button id="size-minus-btn" class="size-control-btn" title="缩小宽度">−</button>
<button id="size-plus-btn" class="size-control-btn" title="放大宽度">+</button>
<button id="reset-position-btn" class="size-control-btn" title="重置位置">↺</button>
<button id="quick-theme-btn" class="quick-theme-btn">🌓</button>
<span class="panel-close">✕</span>
</div>
</div>
<div class="tab-bar">
<button class="tab-btn active" data-tab="api">API</button>
<button class="tab-btn" data-tab="char">角色卡</button>
<button class="tab-btn" data-tab="batch">批量生成</button>
<button class="tab-btn" data-tab="user">用户人设</button>
<button class="tab-btn" data-tab="world">世界书</button>
<button class="tab-btn" data-tab="world-extend">世界扩展</button>
<button class="tab-btn" data-tab="relation">关系网</button>
<button class="tab-btn" data-tab="wardrobe">魔法衣橱</button>
<button class="tab-btn" data-tab="story">故事生成器</button>
<button class="tab-btn" data-tab="playmix">玩法生成器</button>
<button class="tab-btn" data-tab="novel">小说生成器</button>
<button class="tab-btn" data-tab="theater">小剧场</button>
<button class="tab-btn" data-tab="psychology">心理学分析</button>
<button class="tab-btn" data-tab="history">历史</button>
<button class="tab-btn" data-tab="templates">模板库</button>
<button class="tab-btn" data-tab="template-edit">模板编辑</button>
<button class="tab-btn" data-tab="theme">主题</button>
<button class="tab-btn" data-tab="size">大小</button>
</div>

<!-- API -->
<div class="tab-content active" id="tab-api">
${renderApiConfigPanel()}
</div>

<!-- 角色卡 -->
<div class="tab-content" id="tab-char">
<div class="field"><label>简单设定</label><textarea id="char-input" rows="3" placeholder="例如：前锋，是所有屠孝子心里最柔软的地方"></textarea></div>
<button id="char-gen" class="primary-btn">生成角色卡</button>
<div class="field"><label>生成结果</label><textarea id="char-result" class="result-text" rows="10"></textarea></div>
<div class="button-group"><button id="char-copy" class="copy-btn">复制</button><button id="char-clear">清空</button></div>
<div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="char-template-name" placeholder="模板名称"><button id="char-save-tpl">保存</button></div></div>
</div>

<!-- 批量生成 -->
<div class="tab-content" id="tab-batch">
<div class="field"><label>批量设定（每行一个角色）</label><textarea id="batch-input" rows="5" placeholder="例如：&#10;前锋，屠孝子心中最柔软的地方&#10;医生，温柔冷静的急救专家"></textarea></div>
<button id="batch-gen" class="primary-btn">批量生成</button>
<div class="field"><label>生成结果</label><textarea id="batch-result" class="result-text" rows="10"></textarea></div>
<div class="button-group"><button id="batch-copy" class="copy-btn">复制</button><button id="batch-clear">清空</button></div>
</div>

<!-- 用户人设 -->
<div class="tab-content" id="tab-user">
<div class="field"><label>简单设定</label><textarea id="user-input" rows="3" placeholder="例如：菲利普，锋儿最爱的老公"></textarea></div>
<button id="user-gen" class="primary-btn">生成用户人设</button>
<div class="field"><label>生成结果</label><textarea id="user-result" class="result-text" rows="10"></textarea></div>
<div class="button-group"><button id="user-copy" class="copy-btn">复制</button><button id="user-clear">清空</button></div>
<div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="user-template-name" placeholder="模板名称"><button id="user-save-tpl">保存</button></div></div>
</div>

<!-- 世界书 -->
<div class="tab-content" id="tab-world">
<div class="field"><label>设定要求</label><textarea id="world-input" rows="4" placeholder="例如：赛博朋克都市，企业控制，义体改造..."></textarea></div>
<button id="world-gen" class="primary-btn">生成世界书</button>
<div class="field"><label>生成结果</label><textarea id="world-result" class="result-text" rows="8"></textarea></div>
<div class="button-group"><button id="world-copy" class="copy-btn">复制</button><button id="world-clear">清空</button></div>
<div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="world-template-name" placeholder="模板名称"><button id="world-save-tpl">保存</button></div></div>
</div>

<!-- 世界书扩展 -->
<div class="tab-content" id="tab-world-extend">
<div class="field"><label>要扩展的内容</label><textarea id="world-extend-source" rows="6" placeholder="请输入你要扩展的世界观设定或角色设定..."></textarea></div>
<div class="field"><label>扩展类型（可多选）</label>
<div class="extend-checkboxes">
<label><input type="checkbox" class="extend-type-checkbox" value="location"> 地点</label>
<label><input type="checkbox" class="extend-type-checkbox" value="faction"> 势力</label>
<label><input type="checkbox" class="extend-type-checkbox" value="event"> 事件</label>
<label><input type="checkbox" class="extend-type-checkbox" value="culture"> 文化</label>
<label><input type="checkbox" class="extend-type-checkbox" value="technology"> 科技</label>
<label><input type="checkbox" class="extend-type-checkbox" value="character"> 重要人物</label>
</div>
</div>
<button id="world-extend-generate" class="primary-btn" disabled>生成扩展</button>
<div class="field"><label>扩展结果</label><textarea id="world-extend-result" class="result-text" rows="10"></textarea></div>
<div class="button-group"><button id="world-extend-copy" class="copy-btn">复制</button><button id="world-extend-clear">清空</button></div>
</div>

<!-- 关系网文字 -->
<div class="tab-content" id="tab-relation">
<div class="field"><label>角色列表</label><div id="relation-list" class="list-container"></div></div>
<div class="flex-row"><input type="text" id="relation-name" placeholder="角色名称"><button id="relation-add">添加</button></div>
<textarea id="relation-desc" rows="2" placeholder="角色描述（可选）"></textarea>
<button id="relation-gen" class="primary-btn">生成关系描述</button>
<div class="field"><label>关系描述</label><textarea id="relation-result" class="result-text" rows="10"></textarea></div>
<div class="button-group"><button id="relation-copy" class="copy-btn">复制</button><button id="relation-clear">清空</button></div>
<div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="relation-template-name" placeholder="模板名称"><button id="relation-save-tpl">保存</button></div></div>
</div>

<!-- 魔法衣橱 -->
<div class="tab-content" id="tab-wardrobe">
<div class="field"><label>外貌/服装描述</label><textarea id="wardrobe-input" rows="3" placeholder="例如：黑色的哥特服装，银发红瞳"></textarea></div>
<button id="wardrobe-gen" class="primary-btn">生成衣橱</button>
<div class="field"><label>生成结果</label><textarea id="wardrobe-result" class="result-text" rows="12"></textarea></div>
<div class="button-group"><button id="wardrobe-copy" class="copy-btn">复制</button><button id="wardrobe-clear">清空</button></div>
<div class="field"><label>保存模板</label><div class="flex-row"><input type="text" id="wardrobe-template-name" placeholder="模板名称"><button id="wardrobe-save-tpl">保存</button></div></div>
</div>

<!-- 故事生成器（增加用户输入） -->
<div class="tab-content" id="tab-story">
<div class="field"><label>你想看什么？（留空则随机生成）</label>
<textarea id="story-user-wish" rows="3" placeholder="例如：古代宫廷、师徒禁忌、追妻火葬场"></textarea></div>
<div class="field"><label>生成数量</label><input type="number" id="story-count" min="1" max="20" value="3"></div>
<button id="story-gen" class="primary-btn">批量生成故事</button>
<div class="field"><label>生成结果</label><textarea id="story-result" class="result-text" rows="12"></textarea></div>
<div class="button-group"><button id="story-copy" class="copy-btn">复制</button><button id="story-clear">清空</button></div>
</div>

<!-- 玩法生成器（增加用户输入） -->
<div class="tab-content" id="tab-playmix">
<div class="field"><label>你想看什么？（留空则随机生成）</label>
<textarea id="playmix-user-wish" rows="3" placeholder="例如：古风、病娇、甜宠、强制爱"></textarea></div>
<div class="field"><label>生成组数</label><input type="number" id="playmix-group-count" min="1" max="20" value="1"></div>
<button id="playmix-gen" class="primary-btn">生成人设+玩法</button>
<div class="field"><label>生成结果</label><textarea id="playmix-result" class="result-text" rows="16"></textarea></div>
<div class="button-group"><button id="playmix-copy" class="copy-btn">复制</button><button id="playmix-clear">清空</button></div>
</div>

<!-- 小说生成器 -->
<div class="tab-content" id="tab-novel">
<div class="field"><label>你想看什么？（留空则随机生成）</label>
<textarea id="novel-user-input" rows="3" placeholder="例如：星际世界观，军官男主，医生女主，相爱相杀"></textarea></div>
<div class="field"><label>风格标签（可自定义，逗号分隔）</label>
<input type="text" id="novel-style-tags" placeholder="例如：甜宠,虐心,悬疑,轻松,热血,古风,现代,星际" value="甜宠,虐心,悬疑,轻松,热血,古风,现代">
</div>
<div class="field"><label>章节字数：<span id="word-count-val">500</span> 字</label>
<input type="range" id="novel-word-count" min="300" max="1000" step="50" value="500">
</div>
<div class="field"><label>生成章数</label>
<input type="number" id="novel-chapter-count" min="1" max="20" value="5">
</div>
<div class="button-group">
<button id="novel-generate" class="primary-btn" style="flex:1;">生成新小说</button>
<button id="novel-continue" class="primary-btn" style="flex:1; background:#6c8f5e;">续写</button>
<button id="novel-clear" class="primary-btn" style="flex:1; background:#a55a5a;">清空</button>
</div>

<div class="field"><label>书名</label>
<div id="novel-title" class="novel-title-display"></div>
</div>
<div class="field"><label>文案</label>
<textarea id="novel-blurb" class="result-text" rows="4" readonly></textarea>
</div>
<div class="field"><label>章节列表</label>
<div id="novel-chapters" class="novel-chapters"></div>
</div>
<div class="button-group"><button id="novel-copy" class="copy-btn">复制全部</button></div>
</div>

<!-- 小剧场生成器 -->
<div class="tab-content" id="tab-theater">
<div class="field"><label>关键词（可选，留空则随机生成，多个关键词用逗号分隔）</label>
<textarea id="theater-keywords" rows="3" placeholder="例如：穿越,失忆,替身,追妻,误会,破镜重圆"></textarea></div>
<div class="field"><label>生成数量</label>
<input type="number" id="theater-count" min="1" max="20" value="3">
</div>
<button id="theater-gen" class="primary-btn">生成小剧场</button>
<div class="field"><label>生成结果</label>
<textarea id="theater-result" class="result-text" rows="16"></textarea></div>
<div class="button-group"><button id="theater-copy" class="copy-btn">复制</button><button id="theater-clear">清空</button></div>
</div>

<!-- 心理学分析 -->
<div class="tab-content" id="tab-psychology">
<div style="margin-bottom: 20px;">
<h4 style="margin: 0 0 12px 0;">📊 人格/心理分析</h4>
<div class="field"><label>提供人设或剧情</label>
<textarea id="psychology-input" rows="4" placeholder="例如：一个从小被父母忽视的女孩，长大后总是讨好他人，不敢拒绝..."></textarea></div>
<button id="psychology-analyze" class="primary-btn">生成分析报告</button>
<div class="field"><label>分析结果</label>
<textarea id="psychology-result" class="result-text" rows="20" readonly></textarea></div>
<div class="button-group"><button id="psychology-copy" class="copy-btn">复制</button><button id="psychology-clear">清空</button></div>
</div>

<hr style="margin: 20px 0;">

<div>
<h4 style="margin: 0 0 12px 0;">🔮 MBTI角色测试（70题）</h4>
<div class="field"><label>提供人设</label>
<textarea id="mbti-character-input" rows="3" placeholder="例如：一个冷面刑警，独来独往，逻辑缜密，不擅表达情感..."></textarea></div>
<button id="mbti-test" class="primary-btn">开始70题测试</button>
<div class="field"><label>测试结果</label>
<textarea id="mbti-result" class="result-text" rows="16" readonly></textarea></div>
<div class="button-group"><button id="mbti-copy" class="copy-btn">复制</button><button id="mbti-clear">清空</button></div>
</div>
</div>

<!-- 历史 -->
<div class="tab-content" id="tab-history">
<div id="history-list" class="list-container"></div>
<button id="history-clear">清空历史</button>
</div>

<!-- 模板库 -->
<div class="tab-content" id="tab-templates">
<div class="button-group"><button id="tpl-export">导出模板</button><button id="tpl-import">导入模板</button><input type="file" id="tpl-import-file" accept=".json" style="display:none"></div>
<div id="template-list" class="list-container"></div>
</div>

<!-- 模板编辑 -->
<div class="tab-content" id="tab-template-edit">
${renderTemplateEditor()}
</div>

<!-- 主题 -->
<div class="tab-content" id="tab-theme">
<div class="radio-group"><label><input type="radio" name="theme-mode" value="light" ${config.themeMode === 'light' ? 'checked' : ''}> 日间模式</label><label><input type="radio" name="theme-mode" value="dark" ${config.themeMode === 'dark' ? 'checked' : ''}> 夜间模式</label></div>
</div>

<!-- 大小 -->
<div class="tab-content" id="tab-size">
<div class="field"><label>宽度 <span id="width-val">${config.panelWidth}</span> px</label><input type="range" id="width-slider" min="200" max="700" step="10" value="${config.panelWidth}"></div>
<div class="field"><label>高度 <span id="height-val">${config.panelHeight}</span> px</label><input type="range" id="height-slider" min="400" max="800" step="10" value="${config.panelHeight}"></div>
<div class="field"><label>左边距 <span id="left-val">${config.panelLeft}</span> px</label><input type="range" id="left-slider" min="0" max="${window.innerWidth - 50}" step="10" value="${config.panelLeft}"></div>
<div class="field"><label>上边距 <span id="top-val">${config.panelTop}</span> px</label><input type="range" id="top-slider" min="0" max="500" step="10" value="${config.panelTop}"></div>
<div class="field"><label>字体大小 <span id="font-val">13</span> px</label><input type="range" id="font-slider" min="10" max="18" step="1" value="13"></div>
</div>
`;
document.body.appendChild(panel);

// 标题栏按钮功能
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
toastr.success(`宽度: ${newWidth}px`);
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
toastr.success(`宽度: ${newWidth}px`);
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
if (ls) {
ls.value = newLeft;
document.getElementById('left-val').textContent = newLeft;
}
const ts = document.getElementById('top-slider');
if (ts) {
ts.value = newTop;
document.getElementById('top-val').textContent = newTop;
}
toastr.success('面板已重置到右侧');
};
}

// 选项卡切换
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(t => {
t.onclick = () => {
const id = t.dataset.tab;
tabs.forEach(tab => tab.classList.remove('active'));
contents.forEach(c => c.classList.remove('active'));
t.classList.add('active');
document.getElementById(`tab-${id}`).classList.add('active');
const result = document.getElementById(`${id}-result`);
if (result?.classList.contains('result-text')) {
const draft = loadDraft(id);
if (draft && !result.value) result.value = draft;
}
if (id === 'relation') refreshRelationList();
if (id === 'world-extend') {
const checkboxes = document.querySelectorAll('.extend-type-checkbox');
checkboxes.forEach(cb => {
cb.onchange = () => updateExtendTypes();
});
updateExtendTypes();
}
if (id === 'template-edit') {
bindTemplateEditorEvents();
}
};
});

// 关闭按钮
panel.querySelector('.panel-close').onclick = () => panel.style.display = 'none';

// 快捷主题切换
const quickThemeBtn = document.getElementById('quick-theme-btn');
quickThemeBtn.onclick = () => {
const newMode = config.themeMode === 'light' ? 'dark' : 'light';
config.themeMode = newMode;
saveConfig();
document.querySelector(`input[name="theme-mode"][value="${newMode}"]`).checked = true;
applyTheme();
toastr.success(`已切换至${newMode === 'light' ? '日间模式' : '夜间模式'}`);
};

// API
bindApiConfigEvents();

// 主题
const themeRadios = document.querySelectorAll('input[name="theme-mode"]');
function applyTheme() {
const p = document.getElementById(PANEL_ID);
if (config.themeMode === 'light') {
p.classList.add('light-mode');
p.classList.remove('dark-mode');
p.style.backgroundColor = '#ffffff';
p.style.color = '#1a1a1a';
p.style.border = '1px solid #e0e0e0';
} else {
p.classList.remove('light-mode');
p.classList.add('dark-mode');
p.style.backgroundColor = '#1e1e1e';
p.style.color = '#e0e0e0';
p.style.border = '1px solid #333';
document.querySelectorAll('.field input, .field textarea, .field select').forEach(el => {
el.style.backgroundColor = '#2d2d2d';
el.style.borderColor = '#444';
el.style.color = '#e0e0e0';
});
}
}
themeRadios.forEach(r => {
r.onchange = () => {
if (r.checked) {
config.themeMode = r.value;
saveConfig();
applyTheme();
}
};
});

// 大小
const ws = document.getElementById('width-slider');
const hs = document.getElementById('height-slider');
const ls = document.getElementById('left-slider');
const ts = document.getElementById('top-slider');
const fs = document.getElementById('font-slider');
if (ws) {
ws.min = 200;
ws.oninput = () => { const v = ws.value; document.getElementById('width-val').textContent = v; config.panelWidth = parseInt(v); saveConfig(); panel.style.width = `${v}px`; applyTheme(); };
}
if (hs) hs.oninput = () => { const v = hs.value; document.getElementById('height-val').textContent = v; config.panelHeight = parseInt(v); saveConfig(); panel.style.height = `${v}px`; applyTheme(); };
if (ls) ls.oninput = () => { const v = ls.value; document.getElementById('left-val').textContent = v; config.panelLeft = parseInt(v); saveConfig(); panel.style.left = `${v}px`; };
if (ts) ts.oninput = () => { const v = ts.value; document.getElementById('top-val').textContent = v; config.panelTop = parseInt(v); saveConfig(); panel.style.top = `${v}px`; };
if (fs) fs.oninput = () => { const v = fs.value; document.getElementById('font-val').textContent = v; panel.style.fontSize = `${v}px`; };

// 角色卡
const charInput = document.getElementById('char-input');
const charGen = document.getElementById('char-gen');
const charResult = document.getElementById('char-result');
const charCopy = document.getElementById('char-copy');
const charClear = document.getElementById('char-clear');
const charTplName = document.getElementById('char-template-name');
const charSaveTpl = document.getElementById('char-save-tpl');
charGen.onclick = async () => { if (!charInput.value.trim()) { toastr.warning('请输入设定'); return; } await generateCharacter(charInput.value.trim(), 'character', charGen, charResult); };
charCopy.onclick = () => copyToClipboard(charResult.value);
charClear.onclick = () => { charResult.value = ''; };
charSaveTpl.onclick = () => { const n = charTplName.value.trim(); if (!n) { toastr.warning('请输入模板名称'); return; } if (!charResult.value) { toastr.warning('没有内容'); return; } config.savedTemplates.push({ name: n, content: charResult.value }); saveConfig(); refreshTemplateList(); toastr.success(`已保存: ${n}`); charTplName.value = ''; };
charResult.addEventListener('input', () => { saveDraft('char', charResult.value); });
charResult.value = loadDraft('char');

// 批量生成
const batchInput = document.getElementById('batch-input');
const batchGen = document.getElementById('batch-gen');
const batchResult = document.getElementById('batch-result');
const batchCopy = document.getElementById('batch-copy');
const batchClear = document.getElementById('batch-clear');
batchGen.onclick = async () => { if (!batchInput.value.trim()) { toastr.warning('请输入设定'); return; } await batchGenerateCharacters(batchInput.value.trim(), batchGen, batchResult); };
batchCopy.onclick = () => copyToClipboard(batchResult.value);
batchClear.onclick = () => { batchResult.value = ''; };
batchResult.addEventListener('input', () => { saveDraft('batch', batchResult.value); });
batchResult.value = loadDraft('batch');

// 用户人设
const userInput = document.getElementById('user-input');
const userGen = document.getElementById('user-gen');
const userResult = document.getElementById('user-result');
const userCopy = document.getElementById('user-copy');
const userClear = document.getElementById('user-clear');
const userTplName = document.getElementById('user-template-name');
const userSaveTpl = document.getElementById('user-save-tpl');
userGen.onclick = async () => { if (!userInput.value.trim()) { toastr.warning('请输入设定'); return; } await generateCharacter(userInput.value.trim(), 'user', userGen, userResult); };
userCopy.onclick = () => copyToClipboard(userResult.value);
userClear.onclick = () => { userResult.value = ''; };
userSaveTpl.onclick = () => { const n = userTplName.value.trim(); if (!n) { toastr.warning('请输入模板名称'); return; } if (!userResult.value) { toastr.warning('没有内容'); return; } config.savedTemplates.push({ name: n, content: userResult.value }); saveConfig(); refreshTemplateList(); toastr.success(`已保存: ${n}`); userTplName.value = ''; };
userResult.addEventListener('input', () => { saveDraft('user', userResult.value); });
userResult.value = loadDraft('user');

// 世界书
const worldInput = document.getElementById('world-input');
const worldGen = document.getElementById('world-gen');
const worldResult = document.getElementById('world-result');
const worldCopy = document.getElementById('world-copy');
const worldClear = document.getElementById('world-clear');
const worldTplName = document.getElementById('world-template-name');
const worldSaveTpl = document.getElementById('world-save-tpl');
worldGen.onclick = async () => { if (!worldInput.value.trim()) { toastr.warning('请输入设定'); return; } await generateWorldbook(worldInput.value.trim(), worldGen, worldResult); };
worldCopy.onclick = () => copyToClipboard(worldResult.value);
worldClear.onclick = () => { worldResult.value = ''; };
worldSaveTpl.onclick = () => { const n = worldTplName.value.trim(); if (!n) { toastr.warning('请输入模板名称'); return; } if (!worldResult.value) { toastr.warning('没有内容'); return; } config.savedTemplates.push({ name: n, content: worldResult.value }); saveConfig(); refreshTemplateList(); toastr.success(`已保存: ${n}`); worldTplName.value = ''; };
worldResult.addEventListener('input', () => { saveDraft('world', worldResult.value); });
worldResult.value = loadDraft('world');

// 世界书扩展
const worldExtendSource = document.getElementById('world-extend-source');
const worldExtendResult = document.getElementById('world-extend-result');
const worldExtendCopy = document.getElementById('world-extend-copy');
const worldExtendClear = document.getElementById('world-extend-clear');
const worldExtendGen = document.getElementById('world-extend-generate');
worldExtendGen.onclick = async () => { await generateWorldExtend(worldExtendGen); };
worldExtendCopy.onclick = () => copyToClipboard(worldExtendResult.value);
worldExtendClear.onclick = () => { worldExtendResult.value = ''; };
worldExtendResult.addEventListener('input', () => { saveDraft('world-extend', worldExtendResult.value); });
worldExtendResult.value = loadDraft('world-extend');

// 关系网文字
const relationName = document.getElementById('relation-name');
const relationDesc = document.getElementById('relation-desc');
const relationAdd = document.getElementById('relation-add');
const relationGen = document.getElementById('relation-gen');
const relationResult = document.getElementById('relation-result');
const relationCopy = document.getElementById('relation-copy');
const relationClear = document.getElementById('relation-clear');
const relationTplName = document.getElementById('relation-template-name');
const relationSaveTpl = document.getElementById('relation-save-tpl');
relationAdd.onclick = () => { const n = relationName.value.trim(); if (!n) { toastr.warning('请输入角色名称'); return; } addRelationChar(n, relationDesc.value.trim()); relationName.value = ''; relationDesc.value = ''; };
relationGen.onclick = async () => { await generateRelationText(relationGen, relationResult); };
relationCopy.onclick = () => copyToClipboard(relationResult.value);
relationClear.onclick = () => { relationResult.value = ''; };
relationSaveTpl.onclick = () => { const n = relationTplName.value.trim(); if (!n) { toastr.warning('请输入模板名称'); return; } if (!relationResult.value) { toastr.warning('没有内容'); return; } config.savedTemplates.push({ name: n, content: relationResult.value }); saveConfig(); refreshTemplateList(); toastr.success(`已保存: ${n}`); relationTplName.value = ''; };
relationResult.addEventListener('input', () => { saveDraft('relation', relationResult.value); });
relationResult.value = loadDraft('relation');

// 魔法衣橱
const wardrobeInput = document.getElementById('wardrobe-input');
const wardrobeGen = document.getElementById('wardrobe-gen');
const wardrobeResult = document.getElementById('wardrobe-result');
const wardrobeCopy = document.getElementById('wardrobe-copy');
const wardrobeClear = document.getElementById('wardrobe-clear');
const wardrobeTplName = document.getElementById('wardrobe-template-name');
const wardrobeSaveTpl = document.getElementById('wardrobe-save-tpl');
wardrobeGen.onclick = async () => { if (!wardrobeInput.value.trim()) { toastr.warning('请输入外貌/服装描述'); return; } await generateWardrobe(wardrobeInput.value.trim(), wardrobeGen, wardrobeResult); };
wardrobeCopy.onclick = () => copyToClipboard(wardrobeResult.value);
wardrobeClear.onclick = () => { wardrobeResult.value = ''; };
wardrobeSaveTpl.onclick = () => { const n = wardrobeTplName.value.trim(); if (!n) { toastr.warning('请输入模板名称'); return; } if (!wardrobeResult.value) { toastr.warning('没有内容'); return; } config.savedTemplates.push({ name: n, content: wardrobeResult.value }); saveConfig(); refreshTemplateList(); toastr.success(`已保存: ${n}`); wardrobeTplName.value = ''; };
wardrobeResult.addEventListener('input', () => { saveDraft('wardrobe', wardrobeResult.value); });
wardrobeResult.value = loadDraft('wardrobe');

// 故事生成器
const storyGen = document.getElementById('story-gen');
const storyResult = document.getElementById('story-result');
const storyCopy = document.getElementById('story-copy');
const storyClear = document.getElementById('story-clear');
if (storyGen) storyGen.onclick = async () => { await generateStory(storyGen, storyResult); };
if (storyCopy) storyCopy.onclick = () => copyToClipboard(storyResult?.value || '');
if (storyClear) storyClear.onclick = () => { if(storyResult) storyResult.value = ''; };
if(storyResult) storyResult.addEventListener('input', () => { saveDraft('story', storyResult.value); });
if(storyResult) storyResult.value = loadDraft('story');

// 玩法生成器
const playmixGen = document.getElementById('playmix-gen');
const playmixResult = document.getElementById('playmix-result');
const playmixCopy = document.getElementById('playmix-copy');
const playmixClear = document.getElementById('playmix-clear');
if (playmixGen) playmixGen.onclick = async () => { await generatePlayMix(playmixGen, playmixResult); };
if (playmixCopy) playmixCopy.onclick = () => copyToClipboard(playmixResult?.value || '');
if (playmixClear) playmixClear.onclick = () => { if(playmixResult) playmixResult.value = ''; };
if(playmixResult) playmixResult.addEventListener('input', () => { saveDraft('playmix', playmixResult.value); });
if(playmixResult) playmixResult.value = loadDraft('playmix');

// 小说生成器
const novelGen = document.getElementById('novel-generate');
const novelContinue = document.getElementById('novel-continue');
const novelClearBtn = document.getElementById('novel-clear');
const novelCopy = document.getElementById('novel-copy');
const novelWordCount = document.getElementById('novel-word-count');
const wordCountVal = document.getElementById('word-count-val');
if (novelWordCount) {
    novelWordCount.oninput = () => { if(wordCountVal) wordCountVal.textContent = novelWordCount.value; };
}
if (novelGen) novelGen.onclick = async () => { await generateNovel(false); };
if (novelContinue) novelContinue.onclick = async () => { await generateNovel(true); };
if (novelClearBtn) novelClearBtn.onclick = () => { clearNovel(); };
if (novelCopy) novelCopy.onclick = () => { copyNovel(); };

// 小剧场生成器
const theaterGen = document.getElementById('theater-gen');
const theaterResult = document.getElementById('theater-result');
const theaterCopy = document.getElementById('theater-copy');
const theaterClear = document.getElementById('theater-clear');
if (theaterGen) theaterGen.onclick = async () => { await generateTheater(theaterGen, theaterResult); };
if (theaterCopy) theaterCopy.onclick = () => copyToClipboard(theaterResult?.value || '');
if (theaterClear) theaterClear.onclick = () => { if(theaterResult) theaterResult.value = ''; };
if(theaterResult) theaterResult.addEventListener('input', () => { saveDraft('theater', theaterResult.value); });
if(theaterResult) theaterResult.value = loadDraft('theater');

// 心理学分析
const psychologyAnalyze = document.getElementById('psychology-analyze');
const psychologyResult = document.getElementById('psychology-result');
const psychologyCopy = document.getElementById('psychology-copy');
const psychologyClear = document.getElementById('psychology-clear');
if (psychologyAnalyze) psychologyAnalyze.onclick = async () => { await generatePsychologyAnalysis(psychologyAnalyze, psychologyResult); };
if (psychologyCopy) psychologyCopy.onclick = () => copyToClipboard(psychologyResult?.value || '');
if (psychologyClear) psychologyClear.onclick = () => { if(psychologyResult) psychologyResult.value = ''; };
if(psychologyResult) psychologyResult.addEventListener('input', () => { saveDraft('psychology', psychologyResult.value); });
if(psychologyResult) psychologyResult.value = loadDraft('psychology');

// MBTI测试
const mbtiTest = document.getElementById('mbti-test');
const mbtiResult = document.getElementById('mbti-result');
const mbtiCopy = document.getElementById('mbti-copy');
const mbtiClear = document.getElementById('mbti-clear');
if (mbtiTest) mbtiTest.onclick = async () => { await generateMBTITest(mbtiTest, mbtiResult); };
if (mbtiCopy) mbtiCopy.onclick = () => copyToClipboard(mbtiResult?.value || '');
if (mbtiClear) mbtiClear.onclick = () => { if(mbtiResult) mbtiResult.value = ''; };
if(mbtiResult) mbtiResult.addEventListener('input', () => { saveDraft('mbti', mbtiResult.value); });
if(mbtiResult) mbtiResult.value = loadDraft('mbti');

// 模板库
const tplExport = document.getElementById('tpl-export');
const tplImport = document.getElementById('tpl-import');
const tplImportFile = document.getElementById('tpl-import-file');
tplExport.onclick = () => exportTemplates();
tplImport.onclick = () => tplImportFile.click();
tplImportFile.onchange = (e) => { if (e.target.files.length) importTemplates(e.target.files[0]); tplImportFile.value = ''; };

// 历史
const historyClear = document.getElementById('history-clear');
historyClear.onclick = () => { if (confirm('清空所有历史？')) { config.generationHistory = []; saveConfig(); refreshHistoryList(); toastr.success('已清空'); } };

refreshHistoryList();
refreshTemplateList();
refreshRelationList();
applyTheme();

// 加载额外模板
loadExtraTemplates();
loadNovelTemplates();
loadTheaterTemplates();
loadPsychologyTemplates();
loadCurrentNovel();
// 填充额外模板到编辑框
setTimeout(() => {
    const identityEl = document.getElementById('edit-identity');
    if(identityEl && extraTemplates.identity) identityEl.value = extraTemplates.identity;
    const relationEl = document.getElementById('edit-relation');
    if(relationEl && extraTemplates.relation) relationEl.value = extraTemplates.relation;
    const sceneEl = document.getElementById('edit-scene');
    if(sceneEl && extraTemplates.scene) sceneEl.value = extraTemplates.scene;
    const spaceEl = document.getElementById('edit-space');
    if(spaceEl && extraTemplates.gameplay_space) spaceEl.value = extraTemplates.gameplay_space;
    const powerEl = document.getElementById('edit-power');
    if(powerEl && extraTemplates.gameplay_power) powerEl.value = extraTemplates.gameplay_power;
    const psyEl = document.getElementById('edit-psychological');
    if(psyEl && extraTemplates.gameplay_psychological) psyEl.value = extraTemplates.gameplay_psychological;
    const plotEl = document.getElementById('edit-plot');
    if(plotEl && extraTemplates.gameplay_plot) plotEl.value = extraTemplates.gameplay_plot;
    const novelSystemEl = document.getElementById('edit-novel-system');
    if(novelSystemEl && novelTemplates.systemPrompt) novelSystemEl.value = novelTemplates.systemPrompt;
    const novelContinueEl = document.getElementById('edit-novel-continue');
    if(novelContinueEl && novelTemplates.continuePrompt) novelContinueEl.value = novelTemplates.continuePrompt;
    const theaterSystemEl = document.getElementById('edit-theater-system');
    if(theaterSystemEl && theaterTemplates.systemPrompt) theaterSystemEl.value = theaterTemplates.systemPrompt;
    const psychologyAnalysisEl = document.getElementById('edit-psychology-analysis');
    if(psychologyAnalysisEl && psychologyTemplates.analysisPrompt) psychologyAnalysisEl.value = psychologyTemplates.analysisPrompt;
    const mbtiPromptEl = document.getElementById('edit-mbti-prompt');
    if(mbtiPromptEl && psychologyTemplates.mbtiPrompt) mbtiPromptEl.value = psychologyTemplates.mbtiPrompt;
}, 100);
}

// 添加菜单项
function addMenuItem() {
const check = setInterval(() => {
const menu = document.querySelector('#options .options-content');
if (menu) {
clearInterval(check);
if (document.querySelector('.ai-menu-item')) return;
const item = document.createElement('div');
item.className = 'ai-menu-item';
item.innerHTML = '<i class="fa-regular fa-robot"></i> AI人设生成器';
item.onclick = () => document.getElementById(PANEL_ID).style.display = 'flex';
menu.appendChild(item);
}
}, 500);
}

// 样式
const style = document.createElement('style');
style.textContent = `
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.ai-panel {
position: fixed; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
z-index: 100000; display: none; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e0e0e0; font-weight: 500; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.size-control-btn { background: #e0e0e0; border: none; border-radius: 16px; padding: 4px 10px; font-size: 14px; cursor: pointer; font-weight: bold; }
.size-control-btn:hover { background: #d0d0d0; }
.quick-theme-btn { background: #e0e0e0; border: none; border-radius: 16px; padding: 4px 12px; font-size: 12px; cursor: pointer; }
.quick-theme-btn:hover { background: #d0d0d0; }
.panel-close { cursor: pointer; font-size: 18px; opacity: 0.6; margin-left: 4px; }
.panel-close:hover { opacity: 1; }
.tab-bar { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 12px 0 12px; border-bottom: 1px solid #e0e0e0; }
.tab-btn { padding: 6px 12px; background: none; border: none; cursor: pointer; font-size: 12px; color: #666; border-radius: 8px 8px 0 0; }
.tab-btn.active { font-weight: 500; border: 1px solid #e0e0e0; border-bottom-color: #fff; margin-bottom: -1px; }
.tab-content { flex: 1; padding: 16px; overflow-y: auto; display: none; }
.tab-content.active { display: block; }
.field { margin-bottom: 14px; }
.field label { display: block; margin-bottom: 5px; font-size: 12px; font-weight: 500; }
.field input, .field textarea, .field select { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
.field textarea { resize: vertical; font-family: monospace; }
.result-text { font-family: monospace; font-size: 12px; line-height: 1.5; background: #fafafa; }
button { padding: 6px 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
button:hover { filter: brightness(0.95); }
.primary-btn { background: #4A6FA5; color: white; width: 100%; margin-bottom: 14px; }
.primary-btn:hover { background: #3a5a8a; }
.button-group { display: flex; gap: 8px; margin: 10px 0; }
.copy-btn, .save-tpl-btn { background: #4A6FA5; color: white; }
.copy-btn:hover, .save-tpl-btn:hover { background: #3a5a8a; }
.flex-row { display: flex; gap: 8px; }
.flex-row input { flex: 1; }
.radio-group { display: flex; gap: 20px; }
.radio-group label { display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: normal; }
.checkbox-group { display: flex; gap: 16px; flex-wrap: wrap; }
.extend-checkboxes { display: flex; gap: 12px; flex-wrap: wrap; margin: 8px 0; }
.extend-checkboxes label { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px; }
.list-container { max-height: 150px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; }
.char-item, .history-item, .template-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid #eee; cursor: pointer; }
.char-item:hover, .history-item:hover { background: #f5f5f5; }
.history-type { font-weight: 500; font-size: 12px; }
.history-time { font-size: 10px; color: #999; }
.history-preview { font-size: 11px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px; }
.template-actions { display: flex; gap: 8px; }
.empty-state { text-align: center; padding: 20px; color: #999; font-size: 13px; }
.ai-menu-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; border-radius: 6px; transition: background 0.2s; }
.ai-menu-item:hover { background: rgba(0,0,0,0.05); }

/* 模板编辑页两列布局 */
.template-editor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.grid-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.template-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    background: inherit;
}
.template-card h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
}
.save-tpl-btn {
    margin-top: 8px;
    width: 100%;
}
.reset-container {
    margin-top: 20px;
    text-align: center;
}
.reset-btn {
    background: #d32f2f;
    color: white;
    padding: 8px 20px;
}
.reset-btn:hover {
    background: #b71c1c;
}

/* 小说生成器样式 */
.novel-title-display {
    padding: 8px 10px;
    background: #f0f0f0;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
}
.novel-chapters {
    max-height: 500px;
    overflow-y: auto;
}
.chapter-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
}
.chapter-title {
    background: #f5f5f5;
    padding: 10px 12px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
}
.chapter-content-textarea {
    width: 100%;
    padding: 12px;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.5;
    border: none;
    resize: vertical;
    background: #fafafa;
    min-height: 150px;
}

/* 夜间模式适配 */
.dark-mode .template-card {
    border-color: #444;
}
.dark-mode .novel-title-display {
    background: #2d2d2d;
}
.dark-mode .chapter-card {
    border-color: #444;
}
.dark-mode .chapter-title {
    background: #2d2d2d;
    border-bottom-color: #444;
}
.dark-mode .chapter-content-textarea {
    background: #252525;
    color: #e0e0e0;
}

/* 日间模式 */
.light-mode { background: #ffffff; color: #1a1a1a; border: 1px solid #e0e0e0; }
.light-mode .panel-header { background: #f8f8f8; border-bottom-color: #e0e0e0; }
.light-mode .tab-bar { background: #fafafa; border-bottom-color: #e0e0e0; }
.light-mode .tab-btn.active { background: #fff; border-color: #e0e0e0; border-bottom-color: #fff; color: #1a1a1a; }
.light-mode .field input, .light-mode .field textarea, .light-mode .field select { background: #fff; border-color: #ddd; color: #1a1a1a; }
.light-mode .result-text { background: #fafafa; }
.light-mode .size-control-btn { background: #e0e0e0; color: #333; }

/* 夜间模式 */
.dark-mode { background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; }
.dark-mode .panel-header { background: #2d2d2d; border-bottom-color: #333; }
.dark-mode .tab-bar { background: #252525; border-bottom-color: #333; }
.dark-mode .tab-btn { color: #aaa; }
.dark-mode .tab-btn.active { background: #1e1e1e; border-color: #444; border-bottom-color: #1e1e1e; color: #e0e0e0; }
.dark-mode .field input, .dark-mode .field textarea, .dark-mode .field select { background: #2d2d2d; border-color: #444; color: #e0e0e0; }
.dark-mode .result-text { background: #252525; color: #e0e0e0; }
.dark-mode .char-item, .dark-mode .history-item, .dark-mode .template-item { border-bottom-color: #333; }
.dark-mode .char-item:hover, .dark-mode .history-item:hover { background: #2a2a2a; }
.dark-mode .quick-theme-btn { background: #3a3a3a; color: #e0e0e0; }
.dark-mode .quick-theme-btn:hover { background: #4a4a4a; }
.dark-mode .size-control-btn { background: #3a3a3a; color: #e0e0e0; }
.dark-mode .size-control-btn:hover { background: #4a4a4a; }
`;
document.head.appendChild(style);

addMenuItem();
createPanel();
}
})();
