---
name: Bhaleri Hinglish polish
description: Language and render-bug rules enforced across all pages in the production quality pass
---

## Rule 1: All UI text must be Hinglish
Every user-facing string (toast titles, labels, placeholders, empty states, error messages) must be Hinglish — never plain English. Common replacements:
- "Error" → "Kuch gadbad ho gayi"
- "Failed" → "Kuch gadbad ho gayi"
- "Deleted" → "Delete ho gaya"
- "Login to X" → "X karne ke liye login karein"
- "Please fill …" → "… bharo" / "… karein"
- "Not found" → "Nahi mila"
- "No X yet" → "Abhi koi X nahi hai"
- "Feature Unavailable" → "Abhi Unavailable Hai" (features.jsx FeatureGate)
- "Upload failed" → "Upload fail ho gaya"

**Why:** App is for Bhaleri village community; users expect Hindi-English mix consistently everywhere.

## Rule 2: Never call setLocation during render
All auth-guard redirects must use useEffect, not inline:
```jsx
// WRONG — causes React warning
if (!user) { setLocation("/login"); return null; }

// CORRECT
useEffect(() => { if (!user) setLocation("/login"); }, [user]);
if (!user) return null;
```
Files fixed in production-quality pass: conversation.jsx, buy-sell/new.jsx, cart/index.jsx, checkout.jsx, jobs/new.jsx, my-shop/index.jsx, notifications/index.jsx, provider/index.jsx, reels/new.jsx.

**Why:** Calling state-setter (setLocation) during render triggers React warning and can cause infinite loops.

## Rule 3: fileInputRef must be useRef, not useState
In posts/index.jsx CreatePostBox: the dead `const fileInputRef = useState(null)` was removed. File uploads use inline `<label><input type="file" /></label>` pattern — no ref needed.
