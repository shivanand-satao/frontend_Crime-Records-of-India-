import api from "./api";

const chatService = {
    status(signal) { return api.get("/chat/status", { signal }); },
    documents(signal) { return api.get("/chat/documents", { signal }); },
    datasets(signal) { return api.get("/chat/datasets", { signal }); },
    ask(question, table, signal) { return api.post("/chat/ask", { question, table }, { signal }); },
    search(question, documentId, signal) {
        return api.post("/chat/search", { question, ...(documentId ? { document_id: Number(documentId) } : {}) }, { signal });
    },
};

export default chatService;