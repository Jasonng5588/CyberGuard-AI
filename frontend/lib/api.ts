/**
 * API client for the CyberGuard AI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DetectResponse {
    text: string;
    label: 'SAFE' | 'OFFENSIVE' | 'CYBERBULLYING';
    confidence: number;
    risk_score: number;
    model_used: string;
    message_id: number | null;
    explanation: string;
    sub_type?: string;   // e.g. "Verbal Abuse", "Social Exclusion", "Death Threat"
}

export interface ChatResponse {
    user_message: string;
    bot_response: string;
    suggestions: string[];
    log_id: number | null;
    session_id: string | null;
    emotion_detected?: string;
    support_phase?: string | null;
    coping_strategy?: any | null;
}

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface ChatSessionPreview {
    session_id: string;
    last_message: string;
    timestamp: string;
}

export interface AdminSessionPreview {
    session_id: string;
    username: string;
    user_id: number;
    message_count: number;
    last_message: string;
    timestamp: string;
}

export interface AnalyticsData {
    total_messages: number;
    total_bullying: number;
    total_offensive: number;
    total_safe: number;
    bullying_rate: number;
    daily_stats: DailyStat[];
    top_toxic_words: TopWord[];
    recent_detections: DetectionLogEntry[];
}

export interface DailyStat {
    date: string;
    total: number;
    cyberbullying: number;
    offensive: number;
    safe: number;
}

export interface TopWord {
    word: string;
    count: number;
}

export interface DetectionLogEntry {
    id: number;
    message_text: string;
    label: string;
    confidence: number;
    created_at: string;
    username: string;
}

export interface LogEntry {
    id: number;
    user_message: string;
    bot_response: string;
    detection_label: string | null;
    confidence?: number;
    sub_type?: string;
    explanation?: string;
    session_id: string | null;
    timestamp: string;
    username: string | null;
    feedback_helpful?: boolean | null;
}

export interface LogsResponse {
    total: number;
    page: number;
    per_page: number;
    logs: LogEntry[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function detectMessage(text: string, userId?: number): Promise<DetectResponse> {
    const res = await fetch(`${API_URL}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, user_id: userId || 1 }),
    });
    if (!res.ok) throw new Error(`Detection failed: ${res.statusText}`);
    return res.json();
}

export async function sendChatMessage(
    message: string,
    detectionLabel?: string,
    userId?: number,
    sessionId?: string
): Promise<ChatResponse> {
    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            user_id: userId || 1,
            detection_label: detectionLabel,
            session_id: sessionId || null,
        }),
    });
    if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
    return res.json();
}

export async function sendSupportChat(
    message: string,
    userId?: number,
    sessionId?: string
): Promise<ChatResponse> {
    const res = await fetch(`${API_URL}/api/chat/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            user_id: userId || 1,
            session_id: sessionId || null,
        }),
    });
    if (!res.ok) throw new Error(`Support chat failed: ${res.statusText}`);
    return res.json();
}

export async function getAnalytics(userId?: number): Promise<AnalyticsData> {
    const url = userId ? `${API_URL}/api/analytics?user_id=${userId}` : `${API_URL}/api/analytics`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Analytics failed: ${res.statusText}`);
    return res.json();
}

export async function updateProfile(userId: number, username: string): Promise<User> {
    const res = await fetch(`${API_URL}/api/users/me/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: userId, username }),
    });
    if (!res.ok) throw new Error(`Profile update failed: ${res.statusText}`);
    return res.json();
}

export async function getLogs(page = 1, perPage = 20): Promise<LogsResponse> {
    const res = await fetch(`${API_URL}/api/logs?page=${page}&per_page=${perPage}`);
    if (!res.ok) throw new Error(`Logs failed: ${res.statusText}`);
    return res.json();
}

export async function deleteLog(logId: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/logs/chat/${logId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
}

export async function getDetectionLogs(limit = 50): Promise<DetectionLogEntry[]> {
    const res = await fetch(`${API_URL}/api/logs/detections?limit=${limit}`);
    if (!res.ok) throw new Error(`Detection logs failed: ${res.statusText}`);
    return res.json();
}

export async function deleteDetection(detId: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/logs/detections/${detId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
}

export async function getUserChatHistory(userId: number, limit = 50): Promise<LogEntry[]> {
    const res = await fetch(`${API_URL}/api/chat/history/${userId}?limit=${limit}`);
    if (!res.ok) throw new Error(`Chat history failed: ${res.statusText}`);
    return res.json();
}

export async function getUserChatSessions(userId: number, limit = 20): Promise<ChatSessionPreview[]> {
    const res = await fetch(`${API_URL}/api/chat/sessions/${userId}?limit=${limit}`);
    if (!res.ok) throw new Error(`Chat sessions failed: ${res.statusText}`);
    return res.json();
}

export async function getSessionHistory(userId: number, sessionId: string): Promise<LogEntry[]> {
    const res = await fetch(`${API_URL}/api/chat/history/${userId}/${sessionId}`);
    if (!res.ok) throw new Error(`Session history failed: ${res.statusText}`);
    return res.json();
}

export async function getAllSessionsAdmin(limit = 100): Promise<AdminSessionPreview[]> {
    const res = await fetch(`${API_URL}/api/logs/admin/sessions/all?limit=${limit}`);
    if (!res.ok) throw new Error(`Admin sessions failed: ${res.statusText}`);
    return res.json();
}

/** Alias for sendChatMessage — used by chat page */
export const chatWithBot = (message: string, userId?: number, sessionId?: string): Promise<ChatResponse> =>
    sendChatMessage(message, undefined, userId, sessionId);

export interface UserResponse {
    id: number;
    username: string;
    email: string | null;
    created_at: string;
    is_active: boolean;
}

/** Sync a user from Supabase to the backend DB. Creates if not exists, returns existing if found. */
export async function syncUser(email: string, username: string): Promise<UserResponse> {
    const res = await fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
    });
    if (!res.ok) throw new Error(`Sync user failed: ${res.statusText}`);
    return res.json();
}

/** Get user by email from the backend DB */
export async function getUserByEmail(email: string): Promise<UserResponse | null> {
    const res = await fetch(`${API_URL}/api/users/by-email?email=${encodeURIComponent(email)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Get user by email failed: ${res.statusText}`);
    return res.json();
}

/** Delete a specific chat session and all its logs from the backend */
export async function deleteSession(userId: number, sessionId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/chat/sessions/${userId}/${sessionId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete session failed: ${res.statusText}`);
}

/** Export a user's full chat history as a downloadable CSV file */
export async function exportChatHistory(userId: number): Promise<void> {
    const url = `${API_URL}/api/logs/export/csv/${userId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cyberguard_history_user_${userId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/** Submit thumbs up/down feedback on a bot response */
export async function submitFeedback(logId: number, helpful: boolean): Promise<void> {
    const res = await fetch(`${API_URL}/api/logs/feedback/${logId}?helpful=${helpful}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Feedback submission failed: ${res.statusText}`);
}

// ─── Evaluation / RO4 ────────────────────────────────────────────────────────

export interface ClassMetrics {
    precision: number;
    recall: number;
    f1: number;
    true_positives: number;
    false_positives: number;
    false_negatives: number;
}

export interface EvaluationResult {
    total_samples: number;
    correct_predictions: number;
    accuracy: number;
    macro_precision: number;
    macro_recall: number;
    macro_f1: number;
    per_class: { [label: string]: ClassMetrics };
    detailed_results: Array<{ text: string; expected: string; predicted: string; correct: boolean }>;
}

export interface SurveyStats {
    total_responses: number;
    avg_overall: number;
    avg_understanding: number;
    avg_detection: number;
    avg_support: number;
    avg_return: number;
    sus_score: number;
}

export interface FeedbackStats {
    total_feedback: number;
    helpful_count: number;
    unhelpful_count: number;
    helpful_rate: number;
    by_label: {
        [label: string]: {
            total_feedback: number;
            helpful: number;
            unhelpful: number;
            helpful_rate: number;
        };
    };
}

export interface FullEvaluation {
    detection_metrics: EvaluationResult;
    survey_stats: SurveyStats | null;
    feedback_stats: FeedbackStats;
}

/** Run the full evaluation suite (gold test + survey + feedback analysis) */
export async function runEvaluation(): Promise<FullEvaluation> {
    const res = await fetch(`${API_URL}/api/evaluate`);
    if (!res.ok) throw new Error(`Evaluation failed: ${res.statusText}`);
    return res.json();
}

export interface SurveySubmit {
    user_id?: number;
    session_id?: string;
    q_overall: number;
    q_understanding: number;
    q_detection: number;
    q_support: number;
    q_return: number;
    comment?: string;
}

/** Submit a user satisfaction survey response */
export async function submitSurvey(payload: SurveySubmit): Promise<void> {
    const res = await fetch(`${API_URL}/api/evaluate/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Survey submission failed: ${res.statusText}`);
}

