// ─── Global State & Elements ─────────────────────────────────────────────────

const zipaiHistory = [];  // { role, content } objects
const zipaiSystem  = {
  role:    "system",
  content: "You are ZipAI, an advanced AI assistant designed to be helpful, knowledgeable, and adaptable. You were made by securly69."
};

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
    await puter.auth.signIn();    // popup login
    overlay.remove();             // hide overlay
    await puter.auth.whoami();    // verify
    initChat();                   // wire up chat UI
  } catch (err) {
    console.error("Sign-in failed:", err);
    alert("Sign-in failed—please try again.");
  }
});

//////////////////////////////
// Chat Initialization     //
//////////////////////////////

function initChat() {
  addMessage("Hi there! How may I assist you?", "assistant");

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

  addMessage(text, "user");
  chatInput.value = "";
  sendBtn.disabled = true;

  // record user message
  zipaiHistory.push({ role: "user", content: text });

  // show loading…
  const loader = addLoading();

  try {
    const { text: reply } = await askPuter();
    loader.remove();

    const formatted = convertToStyledBold(formatBullets(reply));
    zipaiHistory.push({ role: "assistant", content: formatted });
    addMessage(formatted, "assistant");
  } catch (err) {
    loader.remove();
    console.error("AI error:", err);
    addMessage(`Error: ${err.message}`, "assistant");
  }
}

function addMessage(content, who) {
  const container = document.createElement("div");
  container.className = `message-container ${who}`;
  const avatar  = document.createElement("span");
  avatar.className = "avatar";
  avatar.innerHTML = `<i class="fas ${who==="user"?"fa-user":"fa-robot"}"></i>`;
  const bubble  = document.createElement("div");
  bubble.className = "message";
  bubble.textContent = content;

  if (who==="user") {
    container.append(bubble, avatar);
  } else {
    container.append(avatar, bubble);
  }
  chatBody.appendChild(container);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addLoading() {
  const container = document.createElement("div");
  container.className = "message-container assistant";
  container.innerHTML = `<span class="avatar"><i class="fas fa-robot"></i></span>
                         <div class="message">Thinking...</div>`;
  chatBody.appendChild(container);
  chatBody.scrollTop = chatBody.scrollHeight;
  return container;
}

////////////////////////////////
// Puter.js AI Integration   //
////////////////////////////////

async function askPuter() {
  // construct full messages array
  const msgs = [ zipaiSystem, ...zipaiHistory ];
  try {
    const resp = await puter.ai.chat(
      msgs,                                   // <-- pass array here
      false,                                  // testMode = false
      {
        model:       "gpt-4o-mini",           // pick your model
        temperature: 0.7,
        max_tokens:  2048,
        stream:      false
      }
    );
    const content = resp.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response");
    return { text: content };
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

////////////////////////
// Formatting Utils  ///
////////////////////////

function formatBullets(t) {
  return t.replace(/^(?:-|\*|\u2022)\s+/gm, "• ");
}

function convertToStyledBold(t) {
  const map = {
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
    'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷',
    'k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁',
    'u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇',
    'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝',
    'K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧',
    'U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭'
  };
  return t.replace(/\*\*(.*?)\*\*/g, (_, m) =>
    m.split("").map(c => map[c]||c).join("")
  );
}
