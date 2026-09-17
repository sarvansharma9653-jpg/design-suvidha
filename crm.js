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
    const broadcastView = document.getElementById('view-broadcast');
    const tabChats = document.getElementById('tab-chats-btn');
    const tabLeads = document.getElementById('tab-leads-btn');
    const tabBroadcast = document.getElementById('tab-broadcast-btn');

    // Hide all
    if (chatsView) chatsView.style.display = 'none';
    if (leadsView) leadsView.style.display = 'none';
    if (broadcastView) broadcastView.style.display = 'none';
    if (tabChats) tabChats.classList.remove('active');
    if (tabLeads) tabLeads.classList.remove('active');
    if (tabBroadcast) tabBroadcast.classList.remove('active');

    if (viewName === 'chats') {
        if (chatsView) chatsView.style.display = 'grid';
        if (tabChats) tabChats.classList.add('active');
        renderConversations();
    } else if (viewName === 'leads') {
        if (leadsView) leadsView.style.display = 'block';
        if (tabLeads) tabLeads.classList.add('active');
        renderLeadsTable();
    } else if (viewName === 'broadcast') {
        if (broadcastView) broadcastView.style.display = 'block';
        if (tabBroadcast) tabBroadcast.classList.add('active');
        updateBroadcastContactCount();
        renderBroadcastHistoryTable();
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

// ========================================================================
// 9. BULK WHATSAPP BROADCAST ENGINE
// ========================================================================
let isBroadcasting = false;

function toggleCustomTemplateInput(val) {
    const customInput = document.getElementById('broadcast-custom-template');
    const langRow = document.getElementById('template-lang-row');
    if (val === 'custom') {
        if (customInput) customInput.style.display = 'block';
        if (langRow) langRow.style.display = 'flex';
    } else {
        if (customInput) customInput.style.display = 'none';
        if (langRow) langRow.style.display = 'none';
    }
}

function parseBroadcastContacts() {
    const rawText = document.getElementById('broadcast-contacts-input')?.value || '';
    const lines = rawText.split('\n');
    const contacts = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let name = 'Customer';
        let phone = '';

        if (trimmed.includes(',')) {
            const parts = trimmed.split(',');
            name = parts[0].trim() || 'Customer';
            phone = parts.slice(1).join('').trim();
        } else if (trimmed.includes('\t')) {
            const parts = trimmed.split('\t');
            name = parts[0].trim() || 'Customer';
            phone = parts[1].trim();
        } else {
            const tokens = trimmed.split(/\s+/);
            const lastToken = tokens[tokens.length - 1];
            const lastDigits = lastToken.replace(/\D/g, '');
            if (lastDigits.length >= 10 && tokens.length > 1) {
                name = tokens.slice(0, tokens.length - 1).join(' ').trim();
                phone = lastToken;
            } else {
                const digitsOnly = trimmed.replace(/\D/g, '');
                if (digitsOnly.length >= 10) {
                    phone = trimmed;
                } else {
                    name = trimmed;
                }
            }
        }

        let cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        } else if (cleanPhone.length === 13 && cleanPhone.startsWith('191')) {
            cleanPhone = cleanPhone.substring(1);
        }

        if (cleanPhone.length >= 10) {
            contacts.push({
                name: name,
                phone: cleanPhone,
                rawLine: trimmed,
                index: index + 1
            });
        }
    });

    return contacts;
}

function updateBroadcastContactCount() {
    const contacts = parseBroadcastContacts();
    const countBadge = document.getElementById('broadcast-contact-count');
    const totalStat = document.getElementById('b-stat-total');
    const pendingStat = document.getElementById('b-stat-pending');

    if (countBadge) countBadge.textContent = `${contacts.length} Contacts Detected`;
    if (totalStat && !isBroadcasting) totalStat.textContent = contacts.length;
    if (pendingStat && !isBroadcasting) pendingStat.textContent = contacts.length;
}

function loadCrmLeadsToBroadcast() {
    if (!leads || leads.length === 0) {
        alert('No leads found in CRM to load.');
        return;
    }

    const lines = leads.map(l => `${l.name || 'Lead'}, ${l.phone}`);
    const textarea = document.getElementById('broadcast-contacts-input');
    if (textarea) textarea.value = lines.join('\n');
    updateBroadcastContactCount();
    appendBroadcastLog(`[Loaded] Successfully imported ${leads.length} leads from CRM pipeline.`, 'info');
}

function handleCsvUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split(/\r?\n/);
        const parsed = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (/^(name|phone|mobile|contact)/i.test(trimmed)) return;
            parsed.push(trimmed);
        });

        const textarea = document.getElementById('broadcast-contacts-input');
        if (textarea) textarea.value = parsed.join('\n');
        updateBroadcastContactCount();
        appendBroadcastLog(`[CSV Uploaded] ${file.name} processed. Found ${parsed.length} rows.`, 'info');
    };
    reader.readAsText(file);
    event.target.value = '';
}

function clearBroadcastContacts() {
    if (isBroadcasting) {
        alert('Cannot clear contacts while a campaign is running.');
        return;
    }
    const textarea = document.getElementById('broadcast-contacts-input');
    if (textarea) textarea.value = '';
    updateBroadcastContactCount();
    appendBroadcastLog('[Cleared] Contact list wiped.', 'muted');
}

function clearBroadcastLogs() {
    const terminal = document.getElementById('broadcast-terminal');
    if (terminal) terminal.innerHTML = '<div class="log-line log-muted">[Logs cleared] Ready for next campaign.</div>';
}

function appendBroadcastLog(message, type = 'info') {
    const terminal = document.getElementById('broadcast-terminal');
    if (!terminal) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;
    line.textContent = `[${time}] ${message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function stopBulkBroadcast() {
    if (!isBroadcasting) return;
    isBroadcasting = false;
    appendBroadcastLog('⚠️ Campaign STOP signal received. Halting after current message...', 'fail');
    const startBtn = document.getElementById('btn-start-broadcast');
    const stopBtn = document.getElementById('btn-stop-broadcast');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.style.display = 'none';
}

async function startBulkBroadcast() {
    if (isBroadcasting) return;

    const contacts = parseBroadcastContacts();
    if (contacts.length === 0) {
        alert('Please enter or upload at least 1 valid contact (Name, 10-digit Phone).');
        return;
    }

    const select = document.getElementById('broadcast-template-select');
    let templateName = 'shree_aangan_offer';
    let templateLang = 'en';

    if (select && select.value === 'custom') {
        const customName = document.getElementById('broadcast-custom-template')?.value.trim();
        const customLang = document.getElementById('broadcast-template-lang')?.value.trim() || 'en';
        if (!customName) {
            alert('Please enter your approved Meta template name.');
            document.getElementById('broadcast-custom-template')?.focus();
            return;
        }
        templateName = customName;
        templateLang = customLang;
    } else if (select && select.value === 'hello_world') {
        templateName = 'hello_world';
        templateLang = 'en_US';
    } else {
        templateName = 'shree_aangan_offer';
        templateLang = 'en';
    }

    const confirmed = confirm(
        `Are you sure you want to broadcast "${templateName}" (${templateLang}) to ${contacts.length} recipients?\n\n` +
        `• 1.2 second safe throttle will be applied between sends.\n` +
        `• Recipient names will be personalized where supported.`
    );
    if (!confirmed) return;

    isBroadcasting = true;
    const startBtn = document.getElementById('btn-start-broadcast');
    const stopBtn = document.getElementById('btn-stop-broadcast');
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.style.display = 'inline-block';

    const totalCount = contacts.length;
    let sentCount = 0;
    let failedCount = 0;

    const statTotal = document.getElementById('b-stat-total');
    const statSent = document.getElementById('b-stat-sent');
    const statFailed = document.getElementById('b-stat-failed');
    const statPending = document.getElementById('b-stat-pending');
    const progressFill = document.getElementById('b-progress-fill');
    const progressPercent = document.getElementById('b-progress-percent');
    const progressStatus = document.getElementById('b-progress-status');

    if (statTotal) statTotal.textContent = totalCount;
    if (statSent) statSent.textContent = '0';
    if (statFailed) statFailed.textContent = '0';
    if (statPending) statPending.textContent = totalCount;
    if (progressFill) progressFill.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';
    if (progressStatus) progressStatus.textContent = `Broadcasting 0 of ${totalCount}...`;

    appendBroadcastLog(`🚀 [CAMPAIGN LAUNCHED] Template: "${templateName}" | Total Recipients: ${totalCount}`, 'info');

    for (let i = 0; i < totalCount; i++) {
        if (!isBroadcasting) {
            appendBroadcastLog(`🛑 Campaign stopped by user. Processed ${sentCount + failedCount} of ${totalCount}.`, 'fail');
            break;
        }

        const contact = contacts[i];
        const progressNum = i + 1;

        if (progressStatus) progressStatus.textContent = `Sending ${progressNum} of ${totalCount}: ${contact.name}...`;

        try {
            const payload = {
                to: contact.phone,
                type: 'template',
                templateName: templateName,
                templateLang: templateLang,
                parameters: [contact.name]
            };

            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resData = await response.json();

            if (resData.success) {
                sentCount++;
                if (statSent) statSent.textContent = sentCount;
                const msgId = resData.message_id || resData.messageId || 'OK';
                appendBroadcastLog(`✅ [${progressNum}/${totalCount}] Delivered to ${contact.name} (+${contact.phone}) - Msg ID: ${msgId}`, 'success');

                // Record into persistent history
                addBroadcastHistoryRecord({
                    id: 'bcast_' + Date.now() + '_' + i,
                    timestamp: new Date().toISOString(),
                    name: contact.name,
                    phone: contact.phone,
                    templateName: templateName,
                    status: 'sent',
                    messageId: msgId,
                    error: null
                });
            } else {
                failedCount++;
                if (statFailed) statFailed.textContent = failedCount;
                const errDetail = resData.meta_error || (typeof resData.error === 'object' ? (resData.error?.message || resData.error?.error_data?.details || JSON.stringify(resData.error)) : resData.error) || 'Meta API Error';
                appendBroadcastLog(`❌ [${progressNum}/${totalCount}] Failed for ${contact.name} (+${contact.phone}): ${errDetail}`, 'fail');

                // Record into persistent history
                addBroadcastHistoryRecord({
                    id: 'bcast_' + Date.now() + '_' + i,
                    timestamp: new Date().toISOString(),
                    name: contact.name,
                    phone: contact.phone,
                    templateName: templateName,
                    status: 'failed',
                    messageId: '-',
                    error: errDetail
                });
            }
        } catch (err) {
            failedCount++;
            if (statFailed) statFailed.textContent = failedCount;
            appendBroadcastLog(`❌ [${progressNum}/${totalCount}] Network error for ${contact.name}: ${err.message}`, 'fail');

            addBroadcastHistoryRecord({
                id: 'bcast_' + Date.now() + '_' + i,
                timestamp: new Date().toISOString(),
                name: contact.name,
                phone: contact.phone,
                templateName: templateName,
                status: 'failed',
                messageId: '-',
                error: err.message
            });
        }

        const remaining = totalCount - (sentCount + failedCount);
        if (statPending) statPending.textContent = remaining;
        const percent = Math.round(((sentCount + failedCount) / totalCount) * 100);
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressPercent) progressPercent.textContent = `${percent}%`;

        // 1.2 second safe throttle
        if (i < totalCount - 1 && isBroadcasting) {
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
    }

    isBroadcasting = false;
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.style.display = 'none';
    if (progressStatus) progressStatus.textContent = `Completed! ${sentCount} sent, ${failedCount} failed.`;

    appendBroadcastLog(`🏁 [CAMPAIGN FINISHED] Total: ${totalCount} | Sent: ${sentCount} | Failed: ${failedCount}`, sentCount > 0 ? 'success' : 'fail');
    renderBroadcastHistoryTable();
}

// ========================================================================
// 10. BROADCAST HISTORY & CAMPAIGN ANALYTICS
// ========================================================================
const BROADCAST_STORAGE_KEY = 'ds_broadcast_history';

function getBroadcastHistory() {
    try {
        const data = localStorage.getItem(BROADCAST_STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading broadcast history:', e);
    }
    // Seed initial records for the messages sent previously
    const initialSeed = [
        {
            id: 'bcast_seed_1',
            timestamp: '2026-09-17T16:45:07.891Z',
            name: 'Krishna Kant Sharma',
            phone: '918739904737',
            templateName: 'shree_aangan_offer',
            status: 'sent',
            messageId: 'wamid.HBgMOTE4NzM5OTA0NzM3FQIAERgSRTY3OTE4OTQxRjhENEZFQ0QzAA==',
            error: null
        },
        {
            id: 'bcast_seed_2',
            timestamp: '2026-09-17T16:44:56.887Z',
            name: 'Sarvan',
            phone: '917707978068',
            templateName: 'shree_aangan_offer',
            status: 'sent',
            messageId: 'wamid.HBgMOTE3NzA3OTc4MDY4FQIAERgSNEQ3NzIxMUIyODJCQzQ4NzQ0AA==',
            error: null
        }
    ];
    try {
        localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(initialSeed));
    } catch (e) {}
    return initialSeed;
}

function saveBroadcastHistory(history) {
    try {
        localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Error saving broadcast history:', e);
    }
}

function addBroadcastHistoryRecord(record) {
    const history = getBroadcastHistory();
    history.unshift(record);
    saveBroadcastHistory(history);
}

function renderBroadcastHistoryTable(filterQuery = '') {
    const history = getBroadcastHistory();
    const tbody = document.getElementById('broadcast-history-tbody');
    const emptyState = document.getElementById('history-empty-state');
    if (!tbody) return;

    tbody.innerHTML = '';

    const query = (filterQuery || document.getElementById('search-history-input')?.value || '').toLowerCase().trim();
    const filtered = history.filter(item => {
        if (!query) return true;
        return (item.name || '').toLowerCase().includes(query) ||
               (item.phone || '').includes(query) ||
               (item.templateName || '').toLowerCase().includes(query) ||
               (item.messageId || '').toLowerCase().includes(query);
    });

    // Lifetime metrics
    const totalCount = history.length;
    const deliveredCount = history.filter(i => i.status === 'sent').length;
    const failedCount = history.filter(i => i.status === 'failed').length;
    const rate = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;

    const statTotal = document.getElementById('h-stat-total');
    const statDelivered = document.getElementById('h-stat-delivered');
    const statFailed = document.getElementById('h-stat-failed');
    const statRate = document.getElementById('h-stat-rate');

    if (statTotal) statTotal.textContent = totalCount;
    if (statDelivered) statDelivered.textContent = deliveredCount;
    if (statFailed) statFailed.textContent = failedCount;
    if (statRate) statRate.textContent = `${rate}%`;

    if (filtered.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        const isSent = item.status === 'sent';
        const dateStr = formatTimeFull(item.timestamp);
        const shortId = item.messageId ? (item.messageId.length > 18 ? item.messageId.slice(0, 8) + '...' + item.messageId.slice(-6) : item.messageId) : '-';

        tr.innerHTML = `
            <td style="color: var(--text-muted);">${dateStr}</td>
            <td><strong>${escapeHtml(item.name || 'Client')}</strong></td>
            <td><code>+${item.phone}</code></td>
            <td><span class="badge-tag">${escapeHtml(item.templateName)}</span></td>
            <td>
                <span class="${isSent ? 'badge-status-sent' : 'badge-status-failed'}">
                    ${isSent ? '✅ Delivered' : '❌ Failed'}
                </span>
            </td>
            <td><code title="${escapeHtml(item.messageId || '')}">${shortId}</code></td>
            <td>
                <div style="display:flex; gap:6px;">
                    <button type="button" class="btn-xs-action" onclick="openAiFollowupModal('${escapeHtml(item.name)}', '${item.phone}')" title="AI Smart Follow-up">
                        🤖 Follow-up
                    </button>
                    <button type="button" class="btn-xs-action" onclick="openChatWithContact('${escapeHtml(item.name)}', '${item.phone}')" title="Open Live Chat">
                        💬 Chat
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterBroadcastHistory() {
    renderBroadcastHistoryTable();
}

function exportBroadcastHistoryCSV() {
    const history = getBroadcastHistory();
    if (!history || history.length === 0) {
        alert('No broadcast history available to export.');
        return;
    }

    let csv = 'Timestamp,Recipient Name,Phone,Template Name,Delivery Status,Message ID,Error\n';
    history.forEach(item => {
        csv += `"${item.timestamp}","${(item.name || '').replace(/"/g, '""')}","+${item.phone}","${item.templateName}","${item.status}","${item.messageId || ''}","${(item.error || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shree_Aangan_Broadcast_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
}

function confirmClearBroadcastHistory() {
    if (!confirm('Are you sure you want to clear the entire broadcast history? This action cannot be undone.')) {
        return;
    }
    localStorage.removeItem(BROADCAST_STORAGE_KEY);
    renderBroadcastHistoryTable();
}

function formatTimeFull(isoString) {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return isoString;
    }
}

// ========================================================================
// 11. AI SMART FOLLOW-UP ASSISTANT
// ========================================================================
let activeFollowup = {
    name: 'Client',
    phone: '',
    strategy: 'courtesy'
};

const FOLLOWUP_STRATEGIES = {
    courtesy: (name) => `Namaste ${name},\n\nAsha hai aapne Jaipur Tonk Road (NH-52) par 136 Bigha Mega Township "Shree Aangan" ka overview dekha hoga. 🏡\n\nAgar aap project ka Layout Map, Plot Dimensions ya 3D Video Tour dekhna chahte hain toh batayein, hum turant yahan WhatsApp par share kar denge!\n\nWebsite: https://sreeagan.vercel.app/\nCall: +91 87399 04737 (Krishnkant Sharma)`,
    site_visit: (name) => `Namaste ${name},\n\nIs weekend hamari company ki taraf se Tonk Road "Shree Aangan" township ke liye Free VIP AC Cab (Pick & Drop) Site Visit plan ho rahi hai. 🚗\n\nAap family ke sath aakar 150 Ft Grand Gate aur 100-500 Sq. Yds plots physically dekh sakte hain. Kya hum aapke liye seats reserve karein?\n\nCall / WhatsApp: +91 87399 04737`,
    limited_units: (name) => `Namaste ${name},\n\nShree Aangan me 60M Tonk Road front ke prime residential plots me sirf limited units baaki hain aur festive discount offer jald expire hone wala hai. ⚡\n\nKya aap current rates aur 80% bank loan approval ke sath plot hold karna chahte hain? Call karein: +91 87399 04737`
};

function openAiFollowupModal(name, phone) {
    activeFollowup.name = name || 'Customer';
    activeFollowup.phone = phone.replace(/[^0-9]/g, '');
    activeFollowup.strategy = 'courtesy';

    const titleEl = document.getElementById('ai-followup-client-title');
    const nameEl = document.getElementById('ai-target-client-name');
    const phoneEl = document.getElementById('ai-target-client-phone');
    const modalEl = document.getElementById('ai-followup-modal');

    if (titleEl) titleEl.textContent = `Smart Follow-up for ${activeFollowup.name}`;
    if (nameEl) nameEl.textContent = activeFollowup.name;
    if (phoneEl) phoneEl.textContent = activeFollowup.phone;

    document.querySelectorAll('.strategy-chip').forEach(c => c.classList.remove('active'));
    document.getElementById('chip-courtesy')?.classList.add('active');

    updateFollowupText();

    if (modalEl) modalEl.style.display = 'flex';
}

function closeAiFollowupModal() {
    const modalEl = document.getElementById('ai-followup-modal');
    if (modalEl) modalEl.style.display = 'none';
}

function selectFollowupStrategy(strategy, el) {
    activeFollowup.strategy = strategy;
    document.querySelectorAll('.strategy-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    updateFollowupText();
}

function updateFollowupText() {
    const generator = FOLLOWUP_STRATEGIES[activeFollowup.strategy] || FOLLOWUP_STRATEGIES.courtesy;
    const text = generator(activeFollowup.name);
    const textarea = document.getElementById('ai-followup-text');
    if (textarea) textarea.value = text;
}

function copyAiFollowupText() {
    const textarea = document.getElementById('ai-followup-text');
    if (!textarea || !textarea.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => {
        alert('Follow-up message copied to clipboard!');
    });
}

async function sendAiFollowupViaApi() {
    const textarea = document.getElementById('ai-followup-text');
    const message = textarea?.value?.trim();
    if (!message) {
        alert('Message cannot be empty.');
        return;
    }

    if (!activeFollowup.phone) {
        alert('Invalid phone number.');
        return;
    }

    const sendBtn = document.getElementById('btn-send-ai-followup');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
    }

    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: activeFollowup.phone,
                type: 'text',
                message: message
            })
        });

        const resData = await response.json();
        if (resData.success) {
            alert(`✅ Follow-up sent to ${activeFollowup.name} (+${activeFollowup.phone})!`);
            addBroadcastHistoryRecord({
                id: 'followup_' + Date.now(),
                timestamp: new Date().toISOString(),
                name: activeFollowup.name,
                phone: activeFollowup.phone,
                templateName: `AI Follow-up (${activeFollowup.strategy})`,
                status: 'sent',
                messageId: resData.message_id || 'OK',
                error: null
            });
            renderBroadcastHistoryTable();
            closeAiFollowupModal();
        } else {
            alert(`❌ Failed to send: ${resData.meta_error || resData.error || 'Unknown Error'}`);
        }
    } catch (e) {
        alert(`❌ Network error: ${e.message}`);
    } finally {
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = '🚀 Send Follow-up via WhatsApp';
        }
    }
}

function openChatWithContact(name, phone) {
    switchView('chats');
    const cleanP = phone.replace(/[^0-9]/g, '');
    const existing = leads.find(l => (l.phone && l.phone.includes(cleanP)) || (cleanP.includes(l.phone)));
    if (existing) {
        selectContact(existing.id);
    } else {
        const newLead = {
            id: 'lead_' + Date.now(),
            name: name,
            phone: cleanP,
            service: 'Shree Aangan Township',
            stage: 'contacted',
            dealValue: 1500000,
            lastUpdated: new Date().toISOString(),
            notes: 'Broadcast recipient'
        };
        leads.unshift(newLead);
        saveLeads();
        renderConversations();
        selectContact(newLead.id);
    }
}


