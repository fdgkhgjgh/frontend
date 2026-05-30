// dm.js
const DM_SUPABASE_URL = 'https://brxbaaxhzflqwmkfieid.supabase.co';
const DM_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeGJhYXhoemZscXdta2ZpZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzU0MzcsImV4cCI6MjA5NTExMTQzN30.iVKmvcUAYsI_-MzGrFEkF7KNxfQBsKCD1zkkyd8xPSI';
const DM_API_BASE = 'https://api.mless.cc.cd/api';

let dmSupabase = null;
let dmChannel = null;
let currentChatUserId = null;
let currentChatUsername = null;
let dmPanelOpen = false;
let previousUnreadCount = 0;

function getDMUser() {
    return {
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username')
    };
}

function initDMSupabase() {
    if (!dmSupabase) {
        if (window.sharedSupabaseClient) {
            dmSupabase = window.sharedSupabaseClient;
        } else {
            dmSupabase = window.supabase.createClient(DM_SUPABASE_URL, DM_SUPABASE_ANON);
            window.sharedSupabaseClient = dmSupabase;
        }
    }
}

// Toggle DM panel open/close
function toggleDMPanel() {
    initDMSupabase();
    const panel = document.getElementById('dm-panel');
    const overlay = document.getElementById('dm-overlay');
    dmPanelOpen = !dmPanelOpen;

    if (dmPanelOpen) {
        // ✅ Set exact pixel height via JS
        const vh = window.innerHeight;
        panel.style.height = vh + 'px';
        panel.style.display = 'flex';
        overlay.style.display = 'block';
        loadDMUserList();
        subscribeUnread();
    } else {
        panel.style.display = 'none';
        overlay.style.display = 'none';
        if (dmChannel) dmChannel.unsubscribe();
        if (window.dmPollInterval) clearInterval(window.dmPollInterval);
    }
}


// Load all users from backend
async function loadDMUserList() {
    const { userId } = getDMUser();
    const userListEl = document.getElementById('dm-user-list');
    userListEl.innerHTML = '<p style="color:#888; font-size:0.85rem; padding:8px;">Loading...</p>';

    try {
        const response = await fetch(`${DM_API_BASE}/auth/users`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
if (!response.ok) {
    console.error('Users fetch failed:', response.status);
    userListEl.innerHTML = '<p style="color:red;padding:8px;">Please login to see users.</p>';
    return;
}
const data = await response.json();
const users = Array.isArray(data) ? data : [];

        userListEl.innerHTML = '';

        // Get unread counts
        const { data: unreadData } = await dmSupabase
            .from('direct_messages')
            .select('sender_id')
            .eq('receiver_id', userId)
            .eq('is_read', false);

        const unreadCounts = {};
        if (unreadData) {
            unreadData.forEach(msg => {
                unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1;
            });
        }

        users.filter(u => u._id !== userId).forEach(user => {
            const userBtn = document.createElement('div');
            userBtn.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                position: relative;
            `;
            userBtn.setAttribute('data-user-id', user._id);
            userBtn.onmouseenter = () => userBtn.style.background = '#f5f5f5';
            userBtn.onmouseleave = () => userBtn.style.background = '';

            const avatar = document.createElement('div');
            if (user.profilePictureUrl) {
                avatar.innerHTML = `<img src="${user.profilePictureUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`;
            } else {
                avatar.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;background:#4f46e5;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">${user.username.charAt(0).toUpperCase()}</div>`;
            }

            const nameEl = document.createElement('span');
            nameEl.textContent = user.username;
            nameEl.style.cssText = 'flex:1; font-size:0.9rem;';

            userBtn.appendChild(avatar);
            userBtn.appendChild(nameEl);

            // Unread badge
            const count = unreadCounts[user._id] || 0;
            if (count > 0) {
                const badge = document.createElement('span');
                badge.classList.add('user-unread-badge');
                badge.textContent = count;
                badge.style.cssText = `
                    background:red; color:white; border-radius:50%;
                    width:18px; height:18px; line-height:18px;
                    text-align:center; font-size:0.7rem; font-weight:bold;
                `;
                userBtn.appendChild(badge);
            }

            userBtn.addEventListener('click', () => openDMChat(user._id, user.username));
            userListEl.appendChild(userBtn);
        });

        if (userListEl.children.length === 0) {
            userListEl.innerHTML = '<p style="color:#888;padding:8px;">No other users yet.</p>';
        }

    } catch (err) {
        console.error('Load users error:', err);
        userListEl.innerHTML = '<p style="color:red;padding:8px;">Failed to load users.</p>';
    }
}

// Open chat with a specific user
async function openDMChat(userId, username) {
    currentChatUserId = userId;
    currentChatUsername = username;

    document.getElementById('dm-user-list').style.display = 'none';
    const chatWindow = document.getElementById('dm-chat-window');
    chatWindow.style.display = 'flex';
    document.getElementById('dm-chat-username').textContent = username;

    // ✅ Set messages area height dynamically
    const panelHeight = window.innerHeight;
    const headerHeight = 50; // panel header
    const chatHeaderHeight = 44; // chat header with back button
    const inputHeight = 52; // send button + input
    const messagesHeight = panelHeight - headerHeight - chatHeaderHeight - inputHeight;
    document.getElementById('dm-messages').style.height = messagesHeight + 'px';
    document.getElementById('dm-messages').style.maxHeight = messagesHeight + 'px';

    await loadDMMessages();
    subscribeDMChat();

    if (window.dmPollInterval) clearInterval(window.dmPollInterval);
    window.dmPollInterval = setInterval(async () => {
        if (!currentChatUserId) {
            clearInterval(window.dmPollInterval);
            return;
        }
        await loadDMMessages();
    }, 3000);

    // Mark messages as read
// Mark messages as read
const { userId: myId } = getDMUser();
await dmSupabase.from('direct_messages')
    .update({ is_read: true })
    .eq('sender_id', currentChatUserId)
    .eq('receiver_id', myId)
    .eq('is_read', false);

// ✅ Update badge immediately after marking read
await updateUnreadBadge();
}

// Show user list again
function showDMUserList() {
    currentChatUserId = null;
    document.getElementById('dm-chat-window').style.display = 'none';
    document.getElementById('dm-user-list').style.display = 'block';
    if (dmChannel) dmChannel.unsubscribe();
    if (window.dmPollInterval) clearInterval(window.dmPollInterval);
    loadDMUserList();
}

// Load chat messages
async function loadDMMessages() {
    const { userId: myId } = getDMUser();
    const messagesEl = document.getElementById('dm-messages');

    const { data, error } = await dmSupabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${myId},receiver_id.eq.${currentChatUserId}),and(sender_id.eq.${currentChatUserId},receiver_id.eq.${myId})`)
        .order('created_at', { ascending: true })
        .limit(100);

    if (error) { console.error('Load DM error:', error); return; }
    
    // ✅ Only add new messages, don't clear existing
    data.forEach(msg => {
        if (!document.querySelector(`[data-msg-id="${msg.id}"]`)) {
            appendDMMessage(msg);
        }
    });
    
    // ✅ Only auto-scroll if user is near the bottom
const isNearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 100;
if (isNearBottom) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Append a single message
function appendDMMessage(msg) {
    const { userId: myId } = getDMUser();
    const isMe = msg.sender_id === myId;
    const messagesEl = document.getElementById('dm-messages');

    // ✅ Prevent duplicates
    if (msg.id && document.querySelector(`[data-msg-id="${msg.id}"]`)) return;

    const date = new Date(msg.created_at);
    const timeStr = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const div = document.createElement('div');
    if (msg.id) div.setAttribute('data-msg-id', msg.id);
    div.style.cssText = `margin-bottom:8px; text-align:${isMe ? 'right' : 'left'};`;
    div.innerHTML = `
        <div style="font-size:0.7rem; color:#aaa; margin-bottom:2px;">${timeStr}</div>
        <span style="
            display:inline-block;
            background:${isMe ? '#4f46e5' : '#e2e8f0'};
            color:${isMe ? '#fff' : '#333'};
            padding:6px 10px;
            border-radius:12px;
            font-size:0.85rem;
            max-width:80%;
            word-break:break-word;
        ">${msg.message}</span>
    `;
    messagesEl.appendChild(div);
}

// Subscribe to realtime DM messages
function subscribeDMChat() {
    // removed - using polling instead
}

// Send a DM
async function sendDM() {
    const input = document.getElementById('dm-input');
    const message = input.value.trim();
    if (!message || !currentChatUserId) return;

    const { userId: myId, username: myUsername } = getDMUser();
    if (!myId) { alert('请登录后再发送私信Please login to send messages'); return; }

    const { error } = await dmSupabase.from('direct_messages').insert({
        sender_id: myId,
        sender_username: myUsername,
        receiver_id: currentChatUserId,
        receiver_username: currentChatUsername,
        message
    });

    if (error) { console.error('Send DM error:', error); return; }
    input.value = '';
    
    // ✅ Let poll pick it up instead of manually appending
    await loadDMMessages();
    // ✅ Only auto-scroll if near bottom
const isNearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 100;
if (isNearBottom) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Update unread badge on DM button
async function updateUnreadBadge() {
    const { userId: myId } = getDMUser();
    if (!myId || !dmSupabase) return;

    const { data } = await dmSupabase
        .from('direct_messages')
        .select('id')
        .eq('receiver_id', myId)
        .eq('is_read', false);

    const badge = document.getElementById('dm-unread-badge');
    if (!badge) return;
    const count = data ? data.length : 0;

    // ✅ Play sound if new messages arrived
    if (count > previousUnreadCount) {
        playNotificationSound();
    }
    previousUnreadCount = count;

    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Subscribe to unread messages globally
let unreadChannel = null;

function subscribeUnread() {
    // removed - using polling instead
}

// Expose functions globally
window.toggleDMPanel = toggleDMPanel;
window.sendDM = sendDM;
window.showDMUserList = showDMUserList;

window.addEventListener('resize', () => {
    if (dmPanelOpen) {
        const panel = document.getElementById('dm-panel');
        panel.style.height = window.innerHeight + 'px';
    }
});
//sound
function playNotificationSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
}

// Init unread badge on page load
document.addEventListener('DOMContentLoaded', () => {
    const { userId } = getDMUser();
    if (userId) {
        initDMSupabase();
        setTimeout(() => {
            subscribeUnread();
            setInterval(async () => {
                updateUnreadBadge();

                if (currentChatUserId) {
                    loadDMMessages();
                }

                if (dmPanelOpen && !currentChatUserId) {
                    const { userId: myId } = getDMUser();
                    const { data: unreadData } = await dmSupabase
                        .from('direct_messages')
                        .select('sender_id')
                        .eq('receiver_id', myId)
                        .eq('is_read', false);

                    const unreadCounts = {};
                    if (unreadData) {
                        unreadData.forEach(msg => {
                            unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1;
                        });
                    }

                    const userListEl = document.getElementById('dm-user-list');
                    const userItems = userListEl.querySelectorAll('[data-user-id]');
                    userItems.forEach(item => {
                        const uid = item.getAttribute('data-user-id');
                        let badge = item.querySelector('.user-unread-badge');
                        const count = unreadCounts[uid] || 0;
                        if (count > 0) {
                            if (!badge) {
                                badge = document.createElement('span');
                                badge.classList.add('user-unread-badge');
                                badge.style.cssText = `background:red;color:white;border-radius:50%;width:18px;height:18px;line-height:18px;text-align:center;font-size:0.7rem;font-weight:bold;`;
                                item.appendChild(badge);
                            }
                            badge.textContent = count;
                        } else if (badge) {
                            badge.remove();
                        }
                    });
                }
            }, 3000);
        }, 1000); // ✅ closes setTimeout
    } // ✅ closes if (userId)
}); // ✅ closes DOMContentLoaded
