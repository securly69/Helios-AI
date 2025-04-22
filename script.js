const heliosMessageHistory = [];
const HELIOS_API_KEY_PARTS = [
  's', 'k', '-', 'o', 'r', '-', 'v', '1', '-', '8', 'e', 'f', '6', '7', '3', 'c', 
  'a', '3', '4', 'g', 'h', 'i', 'j', 'l', 'm', 'n', '2', '2', '5', '2', '3', '3', '0', 'f', 'c', '2', 'd', '5', '4', 
  '2', 'c', '1', '7', '0', '9', 'e', '9', '3', '3', '1', 'e', '2', 'c', '7', 'd', 
  '6', '9', '0', '4', '4', '5', 'd', '1', '2', '3', '2', '1', '9', 'd', 'a', '3', 
  '6', '0', '0', '5', 'd', '5', '5', '6', 'c',
'b', 'p', 'q', 't', 'u', 'w', 'x', 'y', 'z'
];

const uselessChars = [ 's', 'k', '-', 'o', 'r', '-', 'v', '1', '-', '8', 'e', 'f', '6', '7', '3', 'c', 
  'a', '3', '4', '2', '2', '5', '2', '3', '3', '0', 'f', 'c', '2', 'd', '5', '4', 
  '2', 'c', '1', '7', '0', '9', 'e', '9', '3', '3', '1', 'e', '2', 'c', '7', 'd', 
  '6', '9', '0', '4', '4', '5', 'd', '1', '2', '3', '2', '1', '9', 'd', 'a', '3', 
  '6', '0', '0', '5', 'd', '5', '5', '6', 'c'];

function getHeliosApiKey() {
  const filteredParts = HELIOS_API_KEY_PARTS.filter(part => part !== 'X' && uselessChars.includes(part));
  return filteredParts.join('');
}


const heliosSystemMessage = {
  role: "system",
  content: `You are Helios AI, an advanced AI assistant designed to be helpful, knowledgeable, and adaptable. You were made by dinguschan.`
};

const chatbotToggler = document.querySelector(".wrench-buttonaa");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".send-btn");

chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");

  const existingWelcomeMessage = Array.from(chatbox.children).some(child =>
    child.textContent === "Hi there! How may I assist you?"
  );

  if (!existingWelcomeMessage) {
    addHeliosMessage("Hi there! How may I assist you?", false);
  }
});


closeBtn.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});

sendChatBtn.addEventListener("click", sendHeliosMessage);

chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendHeliosMessage();
  }
});

async function sendHeliosMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addHeliosMessage(userMessage, true);
  chatInput.value = '';

  heliosMessageHistory.push({ role: "user", content: userMessage });
  const loadingElement = addLoadingMessage();

  try {
    const response = await tryHeliosModels(userMessage);
    let formattedResponse = response.text;

    formattedResponse = formatBulletedList(formattedResponse);
    
    formattedResponse = convertToStyledBold(formattedResponse);
    
    heliosMessageHistory.push({ role: "assistant", content: formattedResponse });
    loadingElement.remove();
    addHeliosMessage(formattedResponse, false);
  } catch (error) {
    loadingElement.remove();
    addHeliosMessage(`Error: ${error.message}`, false);
  }
}

function addHeliosMessage(content, isUser) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat", isUser ? "outgoing" : "incoming");

  const messageContent = document.createElement("p");
  messageContent.textContent = content;

  if (!isUser) { 
    const messageAvatar = document.createElement("span");
    messageAvatar.classList.add("incoming-avatar");

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-robot"); 

    messageAvatar.appendChild(icon); 
    messageElement.appendChild(messageAvatar);  
  }

  messageElement.appendChild(messageContent); 
  chatbox.appendChild(messageElement);
  messageElement.scrollIntoView({ behavior: 'smooth' });
}


function addLoadingMessage() {
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Thinking...";
  const loadingElement = document.createElement("div");
  loadingElement.classList.add("chat", "incoming");
  loadingElement.appendChild(loadingMessage);
  chatbox.appendChild(loadingElement);
  loadingElement.scrollIntoView({ behavior: 'smooth' });
  return loadingElement;
}

async function tryHeliosModels(userMessage) {
  const models = [
    { name: "google/gemini-2.0-flash-exp:free", free: true },
    { name: "google/gemini-flash-1.5-exp", free: true },
    { name: "meta-llama/llama-3.2-3b-instruct:free", free: true },
    { name: "mistralai/mistral-7b-instruct:free", free: true }
  ];

  for (let model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getHeliosApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model.name,
          messages: [heliosSystemMessage, ...heliosMessageHistory],
          temperature: 0.7,
          max_tokens: 2048,
          repetition_penalty: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Model ${model.name} failed.`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0].message.content) {
        return { text: data.choices[0].message.content };
      }
    } catch (error) {
      console.warn(`Model ${model.name} failed: ${error.message}`);
    }
  }

  throw new Error("All models failed to respond. API might be exhausted for today.");
}

function formatBulletedList(text) {
  const bulletPattern = /^(?:-|\*|\u2022)\s+/gm; 
  
  return text.replace(bulletPattern, '• ');
}

  // Define a mapping for numbers and letters to their respective stylized forms

function convertToStyledBold(text) {
  const normalToStyled = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 
    'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 
    'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
    'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
    'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭'
  };

  function convertWord(word) {
    return word.split('').map(char => normalToStyled[char] || char).join('');
  }

  return text.replace(/\*\*(.*?)\*\*/g, (match, p1) => convertWord(p1));
}
