// ------------ BOOTSTRAP ON PAGE LOAD ------------
document.addEventListener("DOMContentLoaded", () => {
  // Initial greeting
  addHeliosMessage("Hi there! How may I assist you?", false);

  // Wire up send button & textarea Enter key
  const sendChatBtn = document.querySelector(".send-btn");
  const chatInput   = document.querySelector(".chat-input textarea");

  sendChatBtn.addEventListener("click", sendHeliosMessage);
  chatInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendHeliosMessage();
    }
  });
});


// ------------ HELIOS CORE LOGIC (unchanged) ------------

const heliosMessageHistory = [];
const HELIOS_API_KEY_PARTS = [
  's','k','-','o','r','-','v','1','-','8','e','f','6','7','3','c',
  'a','3','4','g','h','i','j','l','m','n','2','2','5','2','3','3','0','f','c','2','d','5','4',
  '2','c','1','7','0','9','e','9','3','3','1','e','2','c','7','d',
  '6','9','0','4','4','5','d','1','2','3','2','1','9','d','a','3',
  '6','0','0','5','d','5','5','6','c',
  'b','p','q','t','u','w','x','y','z'
];
const uselessChars = [
  's','k','-','o','r','-','v','1','-','8','e','f','6','7','3','c',
  'a','3','4','2','2','5','2','3','3','0','f','c','2','d','5','4',
  '2','c','1','7','0','9','e','9','3','3','1','e','2','c','7','d',
  '6','9','0','4','4','5','d','1','2','3','2','1','9','d','a','3',
  '6','0','0','5','d','5','5','6','c'
];

function getHeliosApiKey() {
  const filteredParts = HELIOS_API_KEY_PARTS.filter(
    part => part !== 'X' && uselessChars.includes(part)
  );
  return filteredParts.join('');
}

const heliosSystemMessage = {
  role: "system",
  content: `You are Helios AI, an advanced AI assistant designed to be helpful, knowledgeable, and adaptable. You were made by dinguschan.`
};

const chatbox     = document.querySelector(".chatbox");

async function sendHeliosMessage() {
  const chatInput = document.querySelector(".chat-input textarea");
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addHeliosMessage(userMessage, true);
  chatInput.value = '';

  heliosMessageHistory.push({ role: "user", content: userMessage });
  const loadingElement = addLoadingMessage();

  try {
    const response = await tryHeliosModels(userMessage);
    let formatted = formatBulletedList(response.text);
    formatted = convertToStyledBold(formatted);

    heliosMessageHistory.push({ role: "assistant", content: formatted });
    loadingElement.remove();
    addHeliosMessage(formatted, false);
  } catch (err) {
    loadingElement.remove();
    addHeliosMessage(`Error: ${err.message}`, false);
  }
}

function addHeliosMessage(content, isUser) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat", isUser ? "outgoing" : "incoming");

  const messageContent = document.createElement("p");
  messageContent.textContent = content;

  if (!isUser) {
    const avatar = document.createElement("span");
    avatar.classList.add("incoming-avatar");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-robot");
    avatar.appendChild(icon);
    messageElement.appendChild(avatar);
  }

  messageElement.appendChild(messageContent);
  chatbox.appendChild(messageElement);
  messageElement.scrollIntoView({ behavior: 'smooth' });
}

function addLoadingMessage() {
  const loadingEl = document.createElement("div");
  loadingEl.classList.add("chat", "incoming");
  const p = document.createElement("p");
  p.textContent = "Thinking...";
  loadingEl.appendChild(p);
  chatbox.appendChild(loadingEl);
  loadingEl.scrollIntoView({ behavior: 'smooth' });
  return loadingEl;
}

async function tryHeliosModels(userMessage) {
  const models = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-flash-1.5-exp",
    "meta-llama/llama-3.2-3b-instruct:free",
    "mistralai/mistral-7b-instruct:free"
  ];

  for (let name of models) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getHeliosApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: name,
          messages: [heliosSystemMessage, ...heliosMessageHistory],
          temperature: 0.7,
          max_tokens: 2048,
          repetition_penalty: 1
        })
      });
      if (!resp.ok) throw new Error(`${name} failed`);
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return { text };
    } catch (warn) {
      console.warn(`Model ${name} error:`, warn);
    }
  }
  throw new Error("All models failed; try again later.");
}

function formatBulletedList(text) {
  return text.replace(/^(?:-|\*|\u2022)\s+/gm, '• ');
}

function convertToStyledBold(text) {
  const map = {
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
    'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷',
    'k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁',
    'u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇',
    'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝',
    'K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧',
    'U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭'
  };
  return text.replace(/\*\*(.*?)\*\*/g, (_, m) =>
    m.split('').map(c => map[c]||c).join('')
  );
}
