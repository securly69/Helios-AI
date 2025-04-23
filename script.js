// ─── Global State & Elements ─────────────────────────────────────────────────

const zipaiMessageHistory = [];
const zipaiSystemMessage = {
  role: "system",
  content: `You are ZipAI, an advanced AI assistant designed to be helpful, knowledgeable, and adaptable. You were made by securly69.`
};

const chatBody  = document.getElementById("chatBody");
const sendBtn   = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");

/////////////////////////////
// Authentication Overlay //
/////////////////////////////

// Create a full-screen sign-in overlay
const overlay = document.createElement("div");
overlay.id = "signInOverlay";
Object.assign(overlay.style, {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
});
overlay.innerHTML = `
  <div style="text-align:center; color:white; font-family:var(--font);">
    <p style="font-size:1.2rem; margin-bottom:1rem;">
      Please sign in to use ZipAI
    </p>
    <button id="overlaySignIn" style="
      padding:0.8rem 1.2rem;
      font-size:1rem;
      border:none;
      border-radius:4px;
      background:var(--bg-bubble-user);
      color:white;
      cursor:pointer;
    ">
      Sign In
    </button>
  </div>
`;
document.body.appendChild(overlay);

// Wire up the overlay sign-in button
document.getElementById("overlaySignIn").addEventListener("click", async () => {
  try {
    await puter.auth.signIn();        // opens Puter.js popup
    document.body.removeChild(overlay);
    initChat();                       // now safe to init chat
  } catch (err) {
    console.error("Sign-in failed:", err);
    alert("Sign-in failed — please try again.");
  }
});

//////////////////////////////
// Chat Initialization     //
//////////////////////////////

function initChat() {
  // Initial greeting
  addZipAIMessage("Hi there! How may I assist you?", false);

  // Enable send button and Enter-key handling
  sendBtn.addEventListener("click", sendZipAIMessage);
  chatInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendZipAIMessage();
    }
  });
  chatInput.addEventListener("input", () => {
    sendBtn.disabled = !chatInput.value.trim();
  });
}

/////////////////////////////
// Message Flow Functions //
/////////////////////////////

async function sendZipAIMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addZipAIMessage(userMessage, true);
  chatInput.value = "";
  sendBtn.disabled = true;

  zipaiMessageHistory.push({ role: "user", content: userMessage });
  const loadingEl = addLoadingMessage();

  try {
    const { text } = await tryZipAIModels();
    let formatted = formatBulletedList(text);
    formatted = convertToStyledBold(formatted);

    zipaiMessageHistory.push({ role: "assistant", content: formatted });
    loadingEl.remove();
    addZipAIMessage(formatted, false);
  } catch (err) {
    loadingEl.remove();
    console.error("AI error:", err);
    addZipAIMessage(`Error: ${err.message}`, false);
  }
}

function addZipAIMessage(content, isUser) {
  const container = document.createElement("div");
  container.classList.add("message-container", isUser ? "user" : "assistant");

  const avatar = document.createElement("span");
  avatar.classList.add("avatar");
  const icon = document.createElement("i");
  icon.classList.add("fas", isUser ? "fa-user" : "fa-robot");
  avatar.appendChild(icon);

  const bubble = document.createElement("div");
  bubble.classList.add("message");
  bubble.textContent = content;

  if (isUser) {
    container.appendChild(bubble);
    container.appendChild(avatar);
  } else {
    container.appendChild(avatar);
    container.appendChild(bubble);
  }

  chatBody.appendChild(container);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addLoadingMessage() {
  const container = document.createElement("div");
  container.classList.add("message-container", "assistant");

  const avatar = document.createElement("span");
  avatar.classList.add("avatar");
  const icon = document.createElement("i");
  icon.classList.add("fas", "fa-robot");
  avatar.appendChild(icon);

  const bubble = document.createElement("div");
  bubble.classList.add("message");
  bubble.textContent = "Thinking...";

  container.appendChild(avatar);
  container.appendChild(bubble);
  chatBody.appendChild(container);
  chatBody.scrollTop = chatBody.scrollHeight;
  return container;
}

////////////////////////////////
// Puter.js AI Integration   //
////////////////////////////////

async function tryZipAIModels() {
  try {
    const response = await puter.ai.chat({
      model:       "gpt-4o",    // or "gpt-3.5-turbo"
      messages:    [zipaiSystemMessage, ...zipaiMessageHistory],
      temperature: 0.7,
      max_tokens:  2048,
      stream:      false
    });
    const content = response.choices?.[0]?.message?.content;
    if (content) return { text: content };
    throw new Error("No response content");
  } catch (err) {
    console.error("Puter.js error:", err);
    throw new Error("Puter.js failed to respond");
  }
}

////////////////////////
// Formatting Utils  ///
////////////////////////

function formatBulletedList(text) {
  return text.replace(/^(?:-|\*|\u2022)\s+/gm, "• ");
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
    m.split("").map(c => map[c] || c).join("")
  );
}
