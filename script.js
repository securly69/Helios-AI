// ─── Global State & Elements ─────────────────────────────────────────────────

const zipaiHistory = [];  // stores just the text content of each message
const zipaiSystemText = "You are ZipAI, an advanced AI assistant designed to be helpful, knowledgeable, and adaptable. You were made by securly69.";

const chatBody   = document.getElementById("chatBody");
const sendBtn    = document.getElementById("sendBtn");
const chatInput  = document.getElementById("chatInput");
const overlay    = document.getElementById("signInOverlay");
const overlayBtn = document.getElementById("overlaySignIn");

/////////////////////////////
// Authentication Overlay //
/////////////////////////////

overlayBtn.addEventListener("click", async () => {
  try {
    await puter.auth.signIn();      // trigger Puter sign-in popup
    overlay.remove();               // hide overlay
    await puter.auth.whoami();      // verify
    initChat();                     // set up chat UI
  } catch (err) {
    console.error("Sign-in failed:", err);
    alert("Sign-in failed—please try again.");
  }
});

//////////////////////////////
// Chat Initialization     //
//////////////////////////////

function initChat() {
  addMessage(zipaiSystemText, false);  // show system greeting as assistant
  addMessage("Hi there! How may I assist you?", false);

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", ev => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      sendMessage();
    }
  });
  chatInput.addEventListener("input", () => {
    sendBtn.disabled = !chatInput.value.trim();
  });
}

/////////////////////////////
// Message Flow Functions //
/////////////////////////////

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, true);
  chatInput.value = "";
  sendBtn.disabled = true;

  zipaiHistory.push({ role: "user", text });
  const loader = addLoading();

  try {
    const aiText = await askPuter();
    zipaiHistory.push({ role: "assistant", text: aiText });

    loader.remove();
    addMessage(aiText, false);
  } catch (err) {
    loader.remove();
    console.error("AI error:", err);
    addMessage(`Error: ${err.message}`, false);
  }
}

function addMessage(content, isUser) {
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
    container.append(bubble, avatar);
  } else {
    container.append(avatar, bubble);
  }

  chatBody.appendChild(container);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addLoading() {
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
  container.append(avatar, bubble);
  chatBody.appendChild(container);
  chatBody.scrollTop = chatBody.scrollHeight;
  return container;
}

////////////////////////////////
// Puter.js AI Integration   //
////////////////////////////////

async function askPuter() {
  // Build one prompt string: system + history
  let prompt = zipaiSystemText + "\n";
  for (let msg of zipaiHistory) {
    prompt += (msg.role === "user" ? "User: " : "Assistant: ") + msg.text + "\n";
  }
  prompt += "Assistant:";

  try {
    // Correct usage: first arg is prompt string :contentReference[oaicite:1]{index=1}
    const resp = await puter.ai.chat(prompt, {
      model: "gpt-4o",          // or "gpt-3.5-turbo"
      temperature: 0.7,
      max_tokens: 2048,
      stream: false
    });

    // resp.text (string) contains the completion
    if (resp.text) return resp.text.trim();
    throw new Error("Empty response");
  } catch (err) {
    console.group("Puter.js call failed");
    console.error(err);
    if (err.response) {
      console.error("Status:", err.response.status);
      try {
        const body = await err.response.text();
        console.error("Body:", body);
      } catch {}
    }
    console.groupEnd();
    throw err;
  }
}
