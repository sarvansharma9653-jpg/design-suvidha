/* ========================================================================
   DESIGN SUVIDHA — WHATSAPP CRM CONTROLLER (crm.js)
   Handles PIN Auth, Live WhatsApp messaging, Webhook sync, & Lead Pipeline
   ======================================================================== */

const DEFAULT_PIN = '950902';

// Initial Sample Data (if first load)
const INITIAL_LEADS = [
    {
        id: 'lead-1',
        name: 'Arun Sharma',
        phone: '917707978068',
        business: 'Performance Marketing & Ads',
        service: 'Meta Ads & Landing Page',
        stage: 'new',
        dealValue: 10000,
        notes: 'Client requested WhatsApp Cloud API integration and lead generation campaign.',
        unread: 1,
        lastUpdated: new Date().toISOString(),
        messages: [
            {
                id: 'm-1',
                sender: 'customer',
                text: 'Hi, I need Meta & Google Ads service for my business.',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'm-2',
                sender: 'business',
                text: 'Hello Arun! Welcome to Design Suvidha. We specialize in high-converting ads and landing pages. What is your daily ads budget?',
                timestamp: new Date(Date.now() - 1800000).toISOString()
            },
            {
                id: 'm-3',
                sender: 'customer',
                text: 'We want qualified leads for our local services. Can you share packages?',
                timestamp: new Date(Date.now() - 600000).toISOString()
            }
        ]
    },
    {
        id: 'lead-2',
        name: 'Rajesh Verma',
        phone: '919509022983',
        business: 'FitPro Gym Center',
        service: 'Graphic Design',
        stage: 'in_progress',
        dealValue: 2500,
        notes: 'Interested in ₹2500 for 10 Posts graphic design package.',
        unread: 0,
        lastUpdated: new Date(Date.now() - 7200000).toISOString(),
        messages: [
            {
                id: 'm-4',
                sender: 'customer',
                text: 'Hello, what is included in the ₹2500 for 10 posts graphic design plan?',
                timestamp: new Date(Date.now() - 7200000).toISOString()
            },
            {
                id: 'm-5',
                sender: 'business',
                text: 'Hi Rajesh! It includes 10 custom high-resolution social media posts, story graphics, custom brand colors, and 2 rounds of revisions.',
                timestamp: new Date(Date.now() - 7000000).toISOString()
            }
        ]
    },
    {
        id: 'lead-3',
        name: 'Pooja Makeovers',
        phone: '918739904737',
        business: 'Beauty Salon & Academy',
        service: 'Corporate Website',
        stage: 'proposal',
        dealValue: 10000,
        notes: 'Proposal sent for multi-page salon portfolio website with booking inquiry form.',
        unread: 0,
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        messages: [
            {
                id: 'm-6',
                sender: 'customer',
                text: 'Can we add a video gallery to the corporate website package?',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'm-7',
                sender: 'business',
                text: 'Yes Pooja! We can easily embed your YouTube shorts and client portfolio reels directly into the website.',
                timestamp: new Date(Date.now() - 82000000).toISOString()
            }
        ]
    }
];

// App State
let currentPinInput = '';
let leads = [];
let activeContactId = null;
let currentFilter = 'all';
let processedWebhookMessageIds = new Set();

// ========================================================================
// 1. PIN AUTHENTICATION SYSTEM
// ========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadLeadsState();
    setupKeypad();
    checkExistingSession();
    startWebhookPolling();
});

function setupKeypad() {
    document.querySelectorAll('.key-btn[data-key]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentPinInput.length < 6) {
                currentPinInput += btn.dataset.key;
                updatePinDisplay();
                if (currentPinInput.length === 6) {
                    verifyPin();
                }
            }
        });
    });

    document.getElementById('key-clear').addEventListener('click', () => {
        currentPinInput = '';
        updatePinDisplay();
        hideError();
    });

    document.getElementById('key-backspace').addEventListener('click', () => {
        currentPinInput = currentPinInput.slice(0, -1);
        updatePinDisplay();
        hideError();
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        const modal = document.getElementById('auth-modal');
        if (modal && modal.style.display !== 'none') {
            if (e.key >= '0' && e.key <= '9') {
                if (currentPinInput.length < 6) {
                    currentPinInput += e.key;
                    updatePinDisplay();
                    if (currentPinInput.length === 6) verifyPin();
                }
            } else if (e.key === 'Backspace') {
                currentPinInput = currentPinInput.slice(0, -1);
                updatePinDisplay();
            } else if (e.key === 'Escape') {
                currentPinInput = '';
                updatePinDisplay();
            }
        }
    });
}

function updatePinDisplay() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < currentPinInput.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function verifyPin() {
    if (currentPinInput === DEFAULT_PIN) {
        sessionStorage.setItem('ds_crm_auth', 'true');
        unlockCRM();
    } else {
        const errEl = document.getElementById('auth-error');
        errEl.style.display = 'block';
        currentPinInput = '';
        setTimeout(() => {
            updatePinDisplay();
        }, 300);
    }
}

function hideError() {
    document.getElementById('auth-error').style.display = 'none';
}

function checkExistingSession() {
    if (sessionStorage.getItem('ds_crm_auth') === 'true') {
        unlockCRM();
    }
}

function unlockCRM() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('crm-app').style.display = 'flex';
    if (!activeContactId && leads.length > 0) {
        selectContact(leads[0].id);
    }
    renderConversations();
    renderLeadsTable();
}

function lockCRM() {
    sessionStorage.removeItem('ds_crm_auth');
    currentPinInput = '';
    updatePinDisplay();
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('crm-app').style.display = 'none';
}

// ========================================================================
// 2. STATE PERSISTENCE
// ========================================================================
function loadLeadsState() {
    const saved = localStorage.getItem('ds_crm_leads');
    if (saved) {
        try {
            leads = JSON.parse(saved);
        } catch (e) {
            leads = INITIAL_LEADS;
        }
    } else {
        leads = INITIAL_LEADS;
        saveLeadsState();
    }
    updateGlobalCounters();
}

function saveLeadsState() {
    localStorage.setItem('ds_crm_leads', JSON.stringify(leads));
    updateGlobalCounters();
}

function updateGlobalCounters() {
    const totalUnread = leads.reduce((acc, curr) => acc + (curr.unread || 0), 0);
    document.getElementById('unread-total-badge').textContent = totalUnread;
    document.getElementById('leads-count').textContent = leads.length;
}

// ========================================================================
// 3. CONVERSATIONS & CHAT RENDERING
// ========================================================================
function renderConversations() {
    const container = document.getElementById('conversations-container');
    const searchVal = (document.getElementById('search-contacts-input')?.value || '').toLowerCase();

    const filtered = leads.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchVal) || item.phone.includes(searchVal);
        const matchesFilter = currentFilter === 'all' || item.stage === currentFilter;
        return matchesSearch && matchesFilter;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">No conversations found.</div>';
        return;
    }

    filtered.forEach(lead => {
        const lastMsg = lead.messages && lead.messages.length > 0 ? lead.messages[lead.messages.length - 1] : null;
        const lastText = lastMsg ? lastMsg.text : 'No messages yet';
        const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        const item = document.createElement('div');
        item.className = `conv-item ${lead.id === activeContactId ? 'active' : ''}`;
        item.onclick = () => selectContact(lead.id);

        item.innerHTML = `
            <div class="avatar-circle">${initials}</div>
            <div class="conv-meta">
                <div class="conv-top-row">
                    <span class="conv-name">${escapeHtml(lead.name)}</span>
                    <span class="conv-time">${formatTime(lead.lastUpdated)}</span>
                </div>
                <div class="conv-preview-row">
                    <span class="conv-last-msg">${escapeHtml(lastText)}</span>
                    ${lead.unread > 0 ? `<span class="conv-badge">${lead.unread}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function selectContact(contactId) {
    activeContactId = contactId;
    const contact = leads.find(l => l.id === contactId);
    if (!contact) return;

    // Reset unread
    contact.unread = 0;
    saveLeadsState();
    renderConversations();

    // Update Chat Header
    document.getElementById('active-chat-name').textContent = contact.name;
    document.getElementById('active-chat-phone').textContent = `+${contact.phone}`;
    const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('active-chat-avatar').textContent = initials;
    
    // Stage Pill
    const stageEl = document.getElementById('active-chat-stage');
    stageEl.className = `stage-pill pill-${contact.stage || 'new'}`;
    stageEl.textContent = formatStageLabel(contact.stage);

    // Direct links
    document.getElementById('direct-wa-link').href = `https://wa.me/${contact.phone}`;
    document.getElementById('direct-call-link').href = `tel:+${contact.phone}`;

    // Update Right Sidebar Info
    document.getElementById('lead-name-val').textContent = contact.name;
    document.getElementById('lead-phone-val').textContent = `+${contact.phone}`;
    document.getElementById('lead-biz-val').textContent = contact.business || 'Not specified';
    document.getElementById('lead-service-val').textContent = contact.service || 'General Inquiry';
    document.getElementById('lead-stage-select').value = contact.stage || 'new';
    document.getElementById('lead-deal-val').value = contact.dealValue || '';
    document.getElementById('lead-notes').value = contact.notes || '';

    // Render Messages Stream
    renderChatStream(contact);
}

function renderChatStream(contact) {
    const stream = document.getElementById('chat-messages-container');
    stream.innerHTML = '';

    if (!contact.messages || contact.messages.length === 0) {
        stream.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 40px; font-size: 13px;">No messages in this chat. Send your first WhatsApp message below!</div>';
        return;
    }

    contact.messages.forEach(msg => {
        const isOut = msg.sender === 'business';
        const bubble = document.createElement('div');
        bubble.className = `msg-bubble ${isOut ? 'outgoing' : 'incoming'}`;
        bubble.innerHTML = `
            ${escapeHtml(msg.text).replace(/\n/g, '<br>')}
            <div class="msg-time-stamp">
                <span>${formatTime(msg.timestamp)}</span>
                ${isOut ? '<span>✓✓</span>' : ''}
            </div>
        `;
        stream.appendChild(bubble);
    });

    // Auto-scroll to bottom
    stream.scrollTop = stream.scrollHeight;
}

// ========================================================================
// 4. SENDING WHATSAPP MESSAGES (Direct Cloud API Integration)
// ========================================================================
async function sendCurrentMessage() {
    const input = document.getElementById('chat-input-field');
    const text = (input.value || '').trim();
    if (!text || !activeContactId) return;

    const contact = leads.find(l => l.id === activeContactId);
    if (!contact) return;

    // Add message locally
    const newMsg = {
        id: 'msg_' + Date.now(),
        sender: 'business',
        text: text,
        timestamp: new Date().toISOString(),
        status: 'sending'
    };

    contact.messages.push(newMsg);
    contact.lastUpdated = new Date().toISOString();
    saveLeadsState();
    renderChatStream(contact);
    renderConversations();
    input.value = '';

    const sendBtn = document.getElementById('send-wa-btn');
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: contact.phone,
                message: text,
                type: 'text'
            })
        });

        const data = await response.json();
        if (data.success) {
            newMsg.status = 'delivered';
            console.log('WhatsApp message sent successfully:', data);
        } else {
            newMsg.status = 'failed';
            console.warn('API message failed or 24hr window closed:', data);
            alert(`WhatsApp Notice: ${data.meta_error || 'Free text window expired. Send a pre-approved template instead!'}`);
        }
    } catch (err) {
        console.error('Network error sending message:', err);
        alert('Network Error: ' + err.message);
    } finally {
        sendBtn.disabled = false;
        saveLeadsState();
        renderChatStream(contact);
    }
}

async function sendWhatsAppTemplate(templateName = 'hello_world') {
    if (!activeContactId) return;
    const contact = leads.find(l => l.id === activeContactId);
    if (!contact) return;

    if (!confirm(`Send pre-approved Meta template "${templateName}" to +${contact.phone}?`)) return;

    const templateMsg = {
        id: 'tmpl_' + Date.now(),
        sender: 'business',
        text: `[Meta Template Sent: ${templateName}]`,
        timestamp: new Date().toISOString()
    };

    contact.messages.push(templateMsg);
    contact.lastUpdated = new Date().toISOString();
    saveLeadsState();
    renderChatStream(contact);

    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: contact.phone,
                type: 'template',
                templateName: templateName,
                languageCode: 'en_US'
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('✅ Meta Template sent successfully to ' + contact.phone);
        } else {
            alert(`❌ Template Send Failed: ${data.meta_error || JSON.stringify(data.error)}`);
        }
    } catch (err) {
        alert('❌ Network error: ' + err.message);
    }
}

function handleInputKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendCurrentMessage();
    }
}

function insertQuickReply(text) {
    const input = document.getElementById('chat-input-field');
    input.value = text;
    input.focus();
}

// ========================================================================
// 5. WEBHOOK POLLING (Sync incoming WhatsApp messages in real-time)
// ========================================================================
function startWebhookPolling() {
    setInterval(async () => {
        if (sessionStorage.getItem('ds_crm_auth') !== 'true') return;
        try {
            const res = await fetch('/api/webhook?action=get_events');
            if (res.ok) {
                const data = await res.json();
                if (data && data.events && data.events.length > 0) {
                    processIncomingEvents(data.events);
                }
            }
        } catch (e) {
            // Ignore background polling errors
        }
    }, 6000);
}

function processIncomingEvents(events) {
    let hasNew = false;
    events.forEach(evt => {
        if (!processedWebhookMessageIds.has(evt.id)) {
            processedWebhookMessageIds.add(evt.id);

            // Find or create lead
            let lead = leads.find(l => l.phone === evt.from || l.phone.endsWith(evt.from) || evt.from.endsWith(l.phone));
            if (!lead) {
                lead = {
                    id: 'lead-' + Date.now(),
                    name: evt.senderName || `WhatsApp User (${evt.from})`,
                    phone: evt.from,
                    business: 'Inbound Inquiry',
                    service: 'General Inquiry',
                    stage: 'new',
                    dealValue: 5000,
                    notes: 'Generated automatically from incoming WhatsApp chat.',
                    unread: 1,
                    lastUpdated: evt.timestamp || new Date().toISOString(),
                    messages: []
                };
                leads.unshift(lead);
            } else {
                lead.unread = (lead.unread || 0) + 1;
                lead.lastUpdated = evt.timestamp || new Date().toISOString();
            }

            lead.messages.push({
                id: evt.id,
                sender: 'customer',
                text: evt.text || '[Attachment/Audio]',
                timestamp: evt.timestamp || new Date().toISOString()
            });

            hasNew = true;
        }
    });

    if (hasNew) {
        saveLeadsState();
        renderConversations();
        renderLeadsTable();
        if (activeContactId) {
            const activeContact = leads.find(l => l.id === activeContactId);
            if (activeContact) renderChatStream(activeContact);
        }
    }
}

// ========================================================================
// 6. PIPELINE & LEAD DETAILS CONTROLLER
// ========================================================================
function updateLeadStage(newStage) {
    if (!activeContactId) return;
    const contact = leads.find(l => l.id === activeContactId);
    if (!contact) return;

    contact.stage = newStage;
    saveLeadsState();
    renderConversations();
    renderLeadsTable();

    const stageEl = document.getElementById('active-chat-stage');
    stageEl.className = `stage-pill pill-${newStage}`;
    stageEl.textContent = formatStageLabel(newStage);
}

function updateDealValue(val) {
    if (!activeContactId) return;
    const contact = leads.find(l => l.id === activeContactId);
    if (!contact) return;
    contact.dealValue = parseFloat(val) || 0;
    saveLeadsState();
    renderLeadsTable();
}

function updateLeadNotes(notes) {
    if (!activeContactId) return;
    const contact = leads.find(l => l.id === activeContactId);
    if (!contact) return;
    contact.notes = notes;
    saveLeadsState();
}

function deleteCurrentConversation() {
    if (!activeContactId) return;
    if (!confirm('Are you sure you want to delete this client conversation and lead?')) return;

    leads = leads.filter(l => l.id !== activeContactId);
    activeContactId = leads.length > 0 ? leads[0].id : null;
    saveLeadsState();
    renderConversations();
    renderLeadsTable();
    if (activeContactId) selectContact(activeContactId);
}

// ========================================================================
// 7. TAB VIEWS & LEADS TABLE
// ========================================================================
function switchView(viewName) {
    const chatsView = document.getElementById('view-chats');
    const leadsView = document.getElementById('view-leads');
    const tabChats = document.getElementById('tab-chats-btn');
    const tabLeads = document.getElementById('tab-leads-btn');

    if (viewName === 'chats') {
        chatsView.style.display = 'grid';
        leadsView.style.display = 'none';
        tabChats.classList.add('active');
        tabLeads.classList.remove('active');
        renderConversations();
    } else {
        chatsView.style.display = 'none';
        leadsView.style.display = 'block';
        tabChats.classList.remove('active');
        tabLeads.classList.add('active');
        renderLeadsTable();
    }
}

function renderLeadsTable() {
    const tbody = document.getElementById('leads-table-body');
    tbody.innerHTML = '';

    leads.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(lead.name)}</strong></td>
            <td>+${lead.phone}</td>
            <td>${escapeHtml(lead.service || 'General')}</td>
            <td><span class="stage-pill pill-${lead.stage || 'new'}">${formatStageLabel(lead.stage)}</span></td>
            <td><strong>₹${(lead.dealValue || 0).toLocaleString('en-IN')}</strong></td>
            <td>${formatTime(lead.lastUpdated)}</td>
            <td>
                <button class="btn-sm-header" onclick="startChatFromTable('${lead.id}')">💬 Chat</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function startChatFromTable(leadId) {
    switchView('chats');
    selectContact(leadId);
}

function exportLeadsCSV() {
    let csv = 'Name,Phone,Business,Service,Stage,DealValue,Notes,LastUpdated\n';
    leads.forEach(l => {
        csv += `"${l.name}","+${l.phone}","${l.business || ''}","${l.service || ''}","${l.stage}","${l.dealValue || 0}","${(l.notes || '').replace(/"/g, '""')}","${l.lastUpdated}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Design_Suvidha_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
}

// ========================================================================
// 8. ADD NEW LEAD MODAL
// ========================================================================
function openNewLeadModal() {
    document.getElementById('add-lead-modal').style.display = 'flex';
}

function closeNewLeadModal() {
    document.getElementById('add-lead-modal').style.display = 'none';
}

function handleNewLeadSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('nl-name').value.trim();
    let phone = document.getElementById('nl-phone').value.replace(/[^0-9]/g, '');
    const biz = document.getElementById('nl-biz').value.trim();
    const service = document.getElementById('nl-service').value;
    const val = parseFloat(document.getElementById('nl-val').value) || 0;

    if (!phone.startsWith('91') && phone.length === 10) {
        phone = '91' + phone;
    }

    const newLead = {
        id: 'lead-' + Date.now(),
        name,
        phone,
        business: biz,
        service,
        stage: 'new',
        dealValue: val,
        notes: 'Created manually in CRM dashboard.',
        unread: 0,
        lastUpdated: new Date().toISOString(),
        messages: []
    };

    leads.unshift(newLead);
    saveLeadsState();
    closeNewLeadModal();
    document.getElementById('new-lead-form').reset();

    switchView('chats');
    selectContact(newLead.id);
}

// ========================================================================
// 9. UTILITIES
// ========================================================================
function formatStageLabel(stage) {
    switch (stage) {
        case 'new': return '🟢 New Lead';
        case 'contacted': return '🟡 Contacted';
        case 'in_progress': return '🔵 In Discussion';
        case 'proposal': return '🟣 Proposal Sent';
        case 'won': return '🏆 Converted';
        case 'lost': return '🔴 Lost';
        default: return '🟢 New Lead';
    }
}

function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function setConversationFilter(filter, el) {
    currentFilter = filter;
    document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    renderConversations();
}

function filterConversations() {
    renderConversations();
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
